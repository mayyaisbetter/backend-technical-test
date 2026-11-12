import { inject } from '@adonisjs/fold'
import { Exception } from '@poppinss/utils'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import { LeaveStatus } from 'App/Enums/LeaveStatus'
import { Role } from 'App/Enums/Role'
import { LeaveRequestRepository } from 'App/Repositories/Contracts/LeaveRequestRepository'
import { UserRepository } from 'App/Repositories/Contracts/UserRepository'
import LeaveRequest from 'App/Models/LeaveRequest'
import User from 'App/Models/User'
import AuditLogService from 'App/Services/AuditLogService'

@inject([
  'App/Repositories/Contracts/LeaveRequestRepository',
  'App/Repositories/Contracts/UserRepository',
  'App/Services/AuditLogService',
])
export default class LeaveService {
  constructor (
    private leaveRequestRepository: LeaveRequestRepository,
    private userRepository: UserRepository,
    private auditLogService: AuditLogService
  ) {}

  public async createLeaveRequest (
    userId: number,
    data: {
      start_date: DateTime
      end_date: DateTime
      reason: string
      attachment?: { moveToDisk: (path: string) => Promise<void>; fileName?: string }
    },
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<LeaveRequest> {
    const startDate = data.start_date
    const endDate = data.end_date

    if (startDate > endDate) {
      throw new Exception(
        'Start date must be before or equal to end date',
        400,
        'E_INVALID_LEAVE_DATES'
      )
    }

    const totalDays = Math.floor(endDate.diff(startDate, 'days').days) + 1

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Exception('User not found', 404, 'E_USER_NOT_FOUND')
    }

    if (user.role !== Role.EMPLOYEE) {
      throw new Exception(
        'Only employees can request leaves',
        400,
        'E_INVALID_USER_ROLE'
      )
    }

    if (totalDays > user.leaveBalance) {
      throw new Exception(
        `Insufficient leave balance. Requested: ${totalDays} day(s), Balance: ${user.leaveBalance} day(s)`,
        400,
        'E_INSUFFICIENT_LEAVE_BALANCE'
      )
    }

    const formattedStartDate = startDate.toFormat('yyyy-MM-dd')
    const formattedEndDate = endDate.toFormat('yyyy-MM-dd')
    const overlapping = await this.leaveRequestRepository.findOverlapping(
      userId,
      formattedStartDate,
      formattedEndDate
    )
    if (overlapping) {
      throw new Exception(
        `Overlapping leave request found from ${overlapping.startDate.toISODate()} to ${overlapping.endDate.toISODate()}`,
        400,
        'E_OVERLAPPING_LEAVE_REQUEST'
      )
    }

    let attachmentUrl: string | null = null
    if (data.attachment) {
      await data.attachment.moveToDisk('leaves')
      attachmentUrl = `leaves/${data.attachment.fileName}`
    }

    const leave = await this.leaveRequestRepository.create({
      userId,
      startDate: startDate,
      endDate: endDate,
      totalDays,
      reason: data.reason,
      attachmentUrl,
      status: LeaveStatus.PENDING,
    })

    await this.auditLogService.log({
      action: 'LEAVE_CREATED',
      actorId: userId,
      targetId: leave.id,
      metadata: {
        totalDays,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    })

    return leave
  }

  public async listLeaves (
    user: User,
    page: number,
    limit: number
  ): Promise<ReturnType<LeaveRequestRepository['findAllPaginated']>> {
    if (user.role === Role.ADMIN) {
      return await this.leaveRequestRepository.findAllPaginated(page, limit)
    }
    return await this.leaveRequestRepository.findAllByUserIdPaginated(user.id, page, limit)
  }

  public async getLeaveById (user: User, id: number): Promise<LeaveRequest> {
    const leave = await this.leaveRequestRepository.findById(id)
    if (!leave) {
      throw new Exception('Leave request not found', 404, 'E_LEAVE_NOT_FOUND')
    }

    if (user.role !== Role.ADMIN && leave.userId !== user.id) {
      throw new Exception('Access denied: You cannot view this leave request', 403, 'E_ACCESS_DENIED')
    }

    return leave
  }

  public async cancelLeaveRequest (
    user: User,
    id: number,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<LeaveRequest> {
    const leave = await this.leaveRequestRepository.findById(id)
    if (!leave) {
      throw new Exception('Leave request not found', 404, 'E_LEAVE_NOT_FOUND')
    }

    if (leave.userId !== user.id) {
      throw new Exception(
        'Access denied: You cannot cancel this leave request',
        403,
        'E_ACCESS_DENIED'
      )
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new Exception(
        `Cannot cancel leave request that is already ${leave.status}`,
        400,
        'E_CANNOT_CANCEL_REQUEST'
      )
    }

    const updatedLeave = await this.leaveRequestRepository.updateStatus(
      leave,
      LeaveStatus.CANCELLED
    )

    await this.auditLogService.log({
      action: 'LEAVE_CANCELLED',
      actorId: user.id,
      targetId: updatedLeave.id,
      metadata: { totalDays: updatedLeave.totalDays },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    })

    return updatedLeave
  }

  public async approveLeaveRequest (
    adminId: number,
    id: number,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<LeaveRequest> {
    const trx = await Database.transaction()
    let updatedLeave: LeaveRequest

    try {
      const leave = await this.leaveRequestRepository.findById(id, trx, true)
      if (!leave) {
        throw new Exception('Leave request not found', 404, 'E_LEAVE_NOT_FOUND')
      }

      if (leave.status !== LeaveStatus.PENDING) {
        throw new Exception(
          `Leave request has already been processed (status: ${leave.status})`,
          400,
          'E_ALREADY_PROCESSED'
        )
      }

      if (leave.userId === adminId) {
        throw new Exception(
          'You cannot approve your own leave request',
          400,
          'E_SELF_APPROVAL_NOT_ALLOWED'
        )
      }

      const employee = await this.userRepository.findById(leave.userId, trx, true)
      if (!employee) {
        throw new Exception('Employee user not found', 404, 'E_EMPLOYEE_NOT_FOUND')
      }

      if (employee.leaveBalance < leave.totalDays) {
        throw new Exception(
          `Insufficient employee leave balance. Required: ${leave.totalDays}, Balance: ${employee.leaveBalance}`,
          400,
          'E_INSUFFICIENT_LEAVE_BALANCE'
        )
      }

      const newBalance = employee.leaveBalance - leave.totalDays
      await this.userRepository.update(employee, { leaveBalance: newBalance }, trx)

      updatedLeave = await this.leaveRequestRepository.updateStatus(
        leave,
        LeaveStatus.APPROVED,
        adminId,
        null,
        trx
      )

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    await this.auditLogService.log({
      action: 'LEAVE_APPROVED',
      actorId: adminId,
      targetId: updatedLeave.id,
      metadata: {
        employeeId: updatedLeave.userId,
        totalDays: updatedLeave.totalDays,
      },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    })

    return updatedLeave
  }

  public async rejectLeaveRequest (
    adminId: number,
    id: number,
    reason: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<LeaveRequest> {
    const leave = await this.leaveRequestRepository.findById(id)
    if (!leave) {
      throw new Exception('Leave request not found', 404, 'E_LEAVE_NOT_FOUND')
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new Exception(
        `Leave request has already been processed (status: ${leave.status})`,
        400,
        'E_ALREADY_PROCESSED'
      )
    }

    if (leave.userId === adminId) {
      throw new Exception(
        'You cannot reject your own leave request',
        400,
        'E_SELF_REJECTION_NOT_ALLOWED'
      )
    }

    const updatedLeave = await this.leaveRequestRepository.updateStatus(
      leave,
      LeaveStatus.REJECTED,
      adminId,
      reason
    )

    await this.auditLogService.log({
      action: 'LEAVE_REJECTED',
      actorId: adminId,
      targetId: updatedLeave.id,
      metadata: { employeeId: updatedLeave.userId, reason },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    })

    return updatedLeave
  }
}

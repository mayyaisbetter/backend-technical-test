import { Exception } from '@poppinss/utils'
import Database from '@ioc:Adonis/Lucid/Database'
import { LeaveStatus } from 'App/Enums/LeaveStatus'
import { Role } from 'App/Enums/Role'
import User from 'App/Models/User'
import LeaveRequest from 'App/Models/LeaveRequest'
import { LeaveRequestRepository } from 'App/Repositories/Contracts/LeaveRequestRepository'
import { UserRepository } from 'App/Repositories/Contracts/UserRepository'
import LucidLeaveRequestRepository from 'App/Repositories/Lucid/LeaveRequestRepository'
import LucidUserRepository from 'App/Repositories/Lucid/UserRepository'

export default class LeaveService {
  private leaveRequestRepository: LeaveRequestRepository = new LucidLeaveRequestRepository()
  private userRepository: UserRepository = new LucidUserRepository()

  public async createLeaveRequest(userId: number, data: any): Promise<LeaveRequest> {
    const startDate = data.start_date // Luxon DateTime
    const endDate = data.end_date // Luxon DateTime

    // 1. Validation: start_date <= end_date
    if (startDate > endDate) {
      throw new Exception('Start date must be before or equal to end date', 400, 'E_INVALID_LEAVE_DATES')
    }

    // Calculate total days
    const totalDays = Math.floor(endDate.diff(startDate, 'days').days) + 1

    // 2. Fetch User and Validate Balance
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Exception('User not found', 404, 'E_USER_NOT_FOUND')
    }

    if (user.role !== Role.EMPLOYEE) {
      throw new Exception('Only employees can request leaves', 400, 'E_INVALID_USER_ROLE')
    }

    if (totalDays > user.leaveBalance) {
      throw new Exception(
        `Insufficient leave balance. Requested: ${totalDays} day(s), Balance: ${user.leaveBalance} day(s)`,
        400,
        'E_INSUFFICIENT_LEAVE_BALANCE'
      )
    }

    // 3. Check Overlapping Leave Requests (non-rejected and non-cancelled)
    const formattedStartDate = startDate.toSQLDate()
    const formattedEndDate = endDate.toSQLDate()
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

    // 4. Handle Attachment File upload path
    let attachmentUrl: string | null = null
    if (data.attachment) {
      // Move to tmp/uploads or local uploads folder
      await data.attachment.moveToDisk('leaves')
      attachmentUrl = data.attachment.fileName
    }

    // 5. Create Request
    return await this.leaveRequestRepository.create({
      userId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      totalDays,
      reason: data.reason,
      attachmentUrl,
      status: LeaveStatus.PENDING,
    })
  }

  public async listLeaves(user: User, page: number, limit: number): Promise<any> {
    if (user.role === Role.ADMIN) {
      return await this.leaveRequestRepository.findAllPaginated(page, limit)
    }
    return await this.leaveRequestRepository.findAllByUserIdPaginated(user.id, page, limit)
  }

  public async getLeaveById(user: User, id: number): Promise<LeaveRequest> {
    const leave = await this.leaveRequestRepository.findById(id)
    if (!leave) {
      throw new Exception('Leave request not found', 404, 'E_LEAVE_NOT_FOUND')
    }

    // Employee can only view their own requests
    if (user.role !== Role.ADMIN && leave.userId !== user.id) {
      throw new Exception('Access denied: You cannot view this leave request', 403, 'E_ACCESS_DENIED')
    }

    return leave
  }

  public async cancelLeaveRequest(user: User, id: number): Promise<LeaveRequest> {
    const leave = await this.leaveRequestRepository.findById(id)
    if (!leave) {
      throw new Exception('Leave request not found', 404, 'E_LEAVE_NOT_FOUND')
    }

    if (leave.userId !== user.id) {
      throw new Exception('Access denied: You cannot cancel this leave request', 403, 'E_ACCESS_DENIED')
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new Exception(
        `Cannot cancel leave request that is already ${leave.status}`,
        400,
        'E_CANNOT_CANCEL_REQUEST'
      )
    }

    return await this.leaveRequestRepository.updateStatus(leave, LeaveStatus.CANCELLED)
  }

  public async approveLeaveRequest(adminId: number, id: number): Promise<LeaveRequest> {
    const trx = await Database.transaction()

    try {
      // Fetch leave request and lock it to prevent double approval race condition
      const leave = await this.leaveRequestRepository.findById(id, trx, true)
      if (!leave) {
        throw new Exception('Leave request not found', 404, 'E_LEAVE_NOT_FOUND')
      }

      if (leave.status !== LeaveStatus.PENDING) {
        throw new Exception(`Leave request has already been processed (status: ${leave.status})`, 400, 'E_ALREADY_PROCESSED')
      }

      // No self-approval check
      if (leave.userId === adminId) {
        throw new Exception('You cannot approve your own leave request', 400, 'E_SELF_APPROVAL_NOT_ALLOWED')
      }

      // Fetch employee user using transaction and row lock to prevent balance deduction race conditions
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

      // Deduct balance
      const newBalance = employee.leaveBalance - leave.totalDays
      await this.userRepository.update(employee, { leaveBalance: newBalance }, trx)

      // Update leave request status
      const updatedLeave = await this.leaveRequestRepository.updateStatus(
        leave,
        LeaveStatus.APPROVED,
        adminId,
        null,
        trx
      )

      await trx.commit()
      return updatedLeave
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async rejectLeaveRequest(adminId: number, id: number, reason: string): Promise<LeaveRequest> {
    const leave = await this.leaveRequestRepository.findById(id)
    if (!leave) {
      throw new Exception('Leave request not found', 404, 'E_LEAVE_NOT_FOUND')
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new Exception(`Leave request has already been processed (status: ${leave.status})`, 400, 'E_ALREADY_PROCESSED')
    }

    // No self-rejection check
    if (leave.userId === adminId) {
      throw new Exception('You cannot reject your own leave request', 400, 'E_SELF_REJECTION_NOT_ALLOWED')
    }

    return await this.leaveRequestRepository.updateStatus(
      leave,
      LeaveStatus.REJECTED,
      adminId,
      reason
    )
  }
}

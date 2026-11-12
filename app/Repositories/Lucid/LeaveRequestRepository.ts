import { LeaveRequestRepository } from 'App/Repositories/Contracts/LeaveRequestRepository'
import LeaveRequest from 'App/Models/LeaveRequest'
import { LeaveStatus } from 'App/Enums/LeaveStatus'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'

export default class LucidLeaveRequestRepository implements LeaveRequestRepository {
  public async findById (
    id: number,
    trx?: TransactionClientContract,
    lock?: boolean
  ): Promise<LeaveRequest | null> {
    const query = LeaveRequest.query()
    if (trx) {
      query.useTransaction(trx)
    }
    if (lock) {
      query.forUpdate()
    }
    return await query.where('id', id).preload('user').preload('approver').first()
  }

  public async findAllByUserId (userId: number): Promise<LeaveRequest[]> {
    return await LeaveRequest.query()
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
  }

  public async findAllByUserIdPaginated (
    userId: number,
    page: number,
    limit: number
  ): Promise<ModelPaginatorContract<LeaveRequest>> {
    return await LeaveRequest.query()
      .where('user_id', userId)
      .preload('approver')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
  }

  public async findAll (): Promise<LeaveRequest[]> {
    return await LeaveRequest.query()
      .preload('user')
      .preload('approver')
      .orderBy('created_at', 'desc')
  }

  public async findAllPaginated (
    page: number,
    limit: number
  ): Promise<ModelPaginatorContract<LeaveRequest>> {
    return await LeaveRequest.query()
      .preload('user')
      .preload('approver')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
  }

  public async findOverlapping (
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<LeaveRequest | null> {
    return await LeaveRequest.query()
      .where('user_id', userId)
      .whereNotIn('status', [LeaveStatus.REJECTED, LeaveStatus.CANCELLED])
      .where('start_date', '<=', endDate)
      .where('end_date', '>=', startDate)
      .first()
  }

  public async create (data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return await LeaveRequest.create(data)
  }

  public async updateStatus (
    leaveRequest: LeaveRequest,
    status: LeaveStatus,
    approvedBy?: number | null,
    rejectionReason?: string | null,
    trx?: TransactionClientContract
  ): Promise<LeaveRequest> {
    if (trx) {
      leaveRequest.useTransaction(trx)
    }
    leaveRequest.status = status
    if (approvedBy !== undefined) {
      leaveRequest.approvedBy = approvedBy
    }
    if (rejectionReason !== undefined) {
      leaveRequest.rejectionReason = rejectionReason
    }
    await leaveRequest.save()
    return leaveRequest
  }
}

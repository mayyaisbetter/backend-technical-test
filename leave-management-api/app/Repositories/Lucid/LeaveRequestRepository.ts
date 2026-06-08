import { LeaveRequestRepository } from 'App/Repositories/Contracts/LeaveRequestRepository'
import LeaveRequest from 'App/Models/LeaveRequest'
import { LeaveStatus } from 'App/Enums/LeaveStatus'

export default class LucidLeaveRequestRepository implements LeaveRequestRepository {
  public async findById(id: number, trx?: any): Promise<LeaveRequest | null> {
    const query = LeaveRequest.query()
    if (trx) {
      query.useTransaction(trx)
    }
    return await query.where('id', id).preload('user').preload('approver').first()
  }

  public async findAllByUserId(userId: number): Promise<LeaveRequest[]> {
    return await LeaveRequest.query().where('user_id', userId).orderBy('created_at', 'desc')
  }

  public async findAllByUserIdPaginated(userId: number, page: number, limit: number): Promise<any> {
    return await LeaveRequest.query()
      .where('user_id', userId)
      .preload('approver')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
  }

  public async findAll(): Promise<LeaveRequest[]> {
    return await LeaveRequest.query().preload('user').preload('approver').orderBy('created_at', 'desc')
  }

  public async findAllPaginated(page: number, limit: number): Promise<any> {
    return await LeaveRequest.query()
      .preload('user')
      .preload('approver')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)
  }

  public async findOverlapping(userId: number, startDate: any, endDate: any): Promise<LeaveRequest | null> {
    // A request overlaps if start_date <= new_end_date AND end_date >= new_start_date
    // and status is not rejected or cancelled
    return await LeaveRequest.query()
      .where('user_id', userId)
      .whereNotIn('status', [LeaveStatus.REJECTED, LeaveStatus.CANCELLED])
      .where('start_date', '<=', endDate)
      .where('end_date', '>=', startDate)
      .first()
  }

  public async create(data: any): Promise<LeaveRequest> {
    return await LeaveRequest.create(data)
  }

  public async updateStatus(
    leaveRequest: LeaveRequest,
    status: LeaveStatus,
    approvedBy?: number | null,
    rejectionReason?: string | null,
    trx?: any
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

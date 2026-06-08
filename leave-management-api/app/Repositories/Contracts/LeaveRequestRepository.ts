import LeaveRequest from 'App/Models/LeaveRequest'
import { LeaveStatus } from 'App/Enums/LeaveStatus'

export interface LeaveRequestRepository {
  findById(id: number, trx?: any): Promise<LeaveRequest | null>
  findAllByUserId(userId: number): Promise<LeaveRequest[]>
  findAllByUserIdPaginated(userId: number, page: number, limit: number): Promise<any>
  findAll(): Promise<LeaveRequest[]>
  findAllPaginated(page: number, limit: number): Promise<any>
  findOverlapping(userId: number, startDate: any, endDate: any): Promise<LeaveRequest | null>
  create(data: any): Promise<LeaveRequest>
  updateStatus(
    leaveRequest: LeaveRequest,
    status: LeaveStatus,
    approvedBy?: number | null,
    rejectionReason?: string | null,
    trx?: any
  ): Promise<LeaveRequest>
}

import LeaveRequest from 'App/Models/LeaveRequest'
import { LeaveStatus } from 'App/Enums/LeaveStatus'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { ModelPaginatorContract } from '@ioc:Adonis/Lucid/Orm'

export abstract class LeaveRequestRepository {
  public abstract findById (id: number, trx?: TransactionClientContract, lock?: boolean): Promise<LeaveRequest | null>
  public abstract findAllByUserId (userId: number): Promise<LeaveRequest[]>
  public abstract findAllByUserIdPaginated (
    userId: number,
    page: number,
    limit: number
  ): Promise<ModelPaginatorContract<LeaveRequest>>
  public abstract findAll (): Promise<LeaveRequest[]>
  public abstract findAllPaginated (
    page: number,
    limit: number
  ): Promise<ModelPaginatorContract<LeaveRequest>>
  public abstract findOverlapping (
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<LeaveRequest | null>
  public abstract create (data: Partial<LeaveRequest>): Promise<LeaveRequest>
  public abstract updateStatus (
    leaveRequest: LeaveRequest,
    status: LeaveStatus,
    approvedBy?: number | null,
    rejectionReason?: string | null,
    trx?: TransactionClientContract
  ): Promise<LeaveRequest>
}

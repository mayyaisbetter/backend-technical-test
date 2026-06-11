import { AuditLogRepository } from 'App/Repositories/Contracts/AuditLogRepository'
import AuditLog from 'App/Models/AuditLog'

export default class LucidAuditLogRepository implements AuditLogRepository {
  public async create (data: Partial<AuditLog>): Promise<AuditLog> {
    return await AuditLog.create(data)
  }
}

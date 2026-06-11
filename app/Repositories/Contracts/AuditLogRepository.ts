import AuditLog from 'App/Models/AuditLog'

export abstract class AuditLogRepository {
  public abstract create (data: Partial<AuditLog>): Promise<AuditLog>
}

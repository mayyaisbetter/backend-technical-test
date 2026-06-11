import { inject } from '@adonisjs/fold'
import { AuditLogRepository } from 'App/Repositories/Contracts/AuditLogRepository'
import Logger from '@ioc:Adonis/Core/Logger'

@inject(['App/Repositories/Contracts/AuditLogRepository'])
export default class AuditLogService {
  constructor (private auditLogRepository: AuditLogRepository) {}

  public async log (data: {
    action: string
    actorId?: number | null
    targetId?: number | null
    metadata?: Record<string, unknown> | null
    ipAddress?: string | null
    userAgent?: string | null
  }): Promise<void> {
    try {
      await this.auditLogRepository.create({
        action: data.action,
        actorId: data.actorId || null,
        targetId: data.targetId || null,
        metadata: data.metadata || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      Logger.warn({ action: data.action, error: message }, 'Audit logging failed')
    }
  }
}

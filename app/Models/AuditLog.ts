import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class AuditLog extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public action: string

  @column({ columnName: 'actor_id' })
  public actorId: number | null

  @column({ columnName: 'target_id' })
  public targetId: number | null

  @column()
  public metadata: Record<string, unknown> | null

  @column({ columnName: 'ip_address' })
  public ipAddress: string | null

  @column({ columnName: 'user_agent' })
  public userAgent: string | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'actorId' })
  public actor: BelongsTo<typeof User>
}

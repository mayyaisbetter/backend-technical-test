import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { LeaveStatus } from 'App/Enums/LeaveStatus'
import User from 'App/Models/User'

export default class LeaveRequest extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public approvedBy: number | null

  @column.date()
  public startDate: DateTime

  @column.date()
  public endDate: DateTime

  @column()
  public totalDays: number

  @column()
  public reason: string

  @column()
  public attachmentUrl: string | null

  @column()
  public status: LeaveStatus

  @column()
  public rejectionReason: string | null

  @belongsTo(() => User, { foreignKey: 'userId' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'approvedBy' })
  public approver: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

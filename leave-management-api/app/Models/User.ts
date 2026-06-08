import { DateTime } from 'luxon'
import { column, BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { Role } from 'App/Enums/Role'
import LeaveRequest from 'App/Models/LeaveRequest'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string | null // Nullable for OAuth-only users

  @column()
  public role: Role

  @column()
  public leaveBalance: number

  @column()
  public oauthProvider: string | null

  @column()
  public oauthId: string | null

  // Relationship: Leaves requested by this user (employee)
  @hasMany(() => LeaveRequest, {
    foreignKey: 'userId',
  })
  public leaveRequests: HasMany<typeof LeaveRequest>

  // Relationship: Leaves processed (approved/rejected) by this user (admin)
  @hasMany(() => LeaveRequest, {
    foreignKey: 'approvedBy',
  })
  public approvedLeaves: HasMany<typeof LeaveRequest>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}

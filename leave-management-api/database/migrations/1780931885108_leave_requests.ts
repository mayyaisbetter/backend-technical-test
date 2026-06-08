import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { LeaveStatus } from 'App/Enums/LeaveStatus'

export default class extends BaseSchema {
  protected tableName = 'leave_requests'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Foreign key to users table (employee)
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').notNullable()
      
      // Foreign key to users table (approver admin) - SET NULL on delete to retain history
      table.integer('approved_by').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.integer('total_days').notNullable()
      table.text('reason').notNullable()
      table.string('attachment_url', 255).nullable()
      table.enum('status', Object.values(LeaveStatus)).defaultTo(LeaveStatus.PENDING).notNullable()
      table.text('rejection_reason').nullable()

      // Indices for performance optimization
      table.index('user_id')
      table.index('approved_by')
      table.index('status')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

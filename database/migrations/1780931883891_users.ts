import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { Role } from 'App/Enums/Role'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).nullable() // Nullable to support OAuth login
      table.enum('role', Object.values(Role)).defaultTo(Role.EMPLOYEE).notNullable()
      table.integer('leave_balance').defaultTo(12).notNullable()
      
      // OAuth integration columns
      table.string('oauth_provider', 50).nullable()
      table.string('oauth_id', 255).nullable()

      // Unique composite index for OAuth provider and ID
      table.unique(['oauth_provider', 'oauth_id'])

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

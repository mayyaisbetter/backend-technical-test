import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('action', 50).notNullable()
      table.integer('actor_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      table.integer('target_id').unsigned().nullable()
      table.jsonb('metadata').nullable()
      table.string('ip_address', 45).nullable()
      table.text('user_agent').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

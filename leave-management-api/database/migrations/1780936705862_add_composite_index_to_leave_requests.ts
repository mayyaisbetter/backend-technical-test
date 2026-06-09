import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'leave_requests'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['user_id', 'status', 'start_date', 'end_date'], 'leave_requests_overlap_idx')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['user_id', 'status', 'start_date', 'end_date'], 'leave_requests_overlap_idx')
    })
  }
}

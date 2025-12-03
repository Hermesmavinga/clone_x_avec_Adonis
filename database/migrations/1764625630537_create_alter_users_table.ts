import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('banner_url').nullable()
      table.string('location').nullable()
      table.string('website').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('banner_url')
      table.dropColumn('location')
      table.dropColumn('website')
    })
  }
}

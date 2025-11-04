import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tweets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('content').notNullable()
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')

      table.string('media_url').nullable()
      table.string('media_path').nullable()
      table.integer('likes_count').defaultTo(0)
      table.integer('retweets_count').defaultTo(0)
      table.integer('comments_count').defaultTo(0)
      table.boolean('is_retweet').defaultTo(false)
      table
        .integer('parent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tweets')
        .onDelete('CASCADE') //  index utile pour retrouver les réponses à un tweet // si le tweet parent est supprimé, la réponse aussi
        .index()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

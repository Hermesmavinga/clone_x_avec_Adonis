import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'follows'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // Foreign keys vers users
      table
        .integer('follower_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index() // suivre tous les utilisateurs suivis par X

      table
        .integer('followed_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .index() // retrouver tous les followers d’un utilisateur

      table.unique(['follower_id', 'followed_id']) // un utilisateur ne peut suivre un autre utilisateur qu'une seule fois

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'
import Like from '#models/like'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { hasMany } from '@adonisjs/lucid/orm'
import Retweet from '#models/retweet'

export default class Tweet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

  @column()
  declare userId: number

  @column()
  declare mediaUrl: string | null

  @column()
  declare mediaPath: string | null

  @column()
  declare likesCount: number

  @column()
  declare retweetsCount: number

  @column()
  declare commentsCount: number

  @column()
  declare is_retweet: boolean

  // Clé étrangère optionnelle vers le tweet parent (si c'est une réponse)
  @column()
  declare parentId?: number | null

  @belongsTo(() => Tweet, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof Tweet> // relation vers le tweet parent

  @hasMany(() => Tweet, { foreignKey: 'parentId' })
  declare replies: HasMany<typeof Tweet> // relation vers les réponses

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @hasMany(() => Retweet)
  declare retweetsby: HasMany<typeof Retweet>
}

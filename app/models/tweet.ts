import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { belongsTo } from '@adonisjs/lucid/orm'

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

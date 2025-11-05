import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Follow extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare followerId: number

  @column()
  declare followedId: number

  @belongsTo(() => User, { foreignKey: 'followerId' })
  declare follower: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'followedId' })
  declare followed: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}

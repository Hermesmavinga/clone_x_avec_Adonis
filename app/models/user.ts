import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import Tweet from '#models/tweet'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { hasMany } from '@adonisjs/lucid/orm'
import Like from '#models/like'
import Retweet from './retweet.js'
import Follow from './follow.js'
import Block from './block.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'fullname' })
  declare fullname: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare avatarUrl: string | null

  @column()
  declare bannerUrl: string | null

  @column()
  declare isVerified: boolean

  @column()
  declare location: string | null

  @column()
  declare website: string | null

  @column()
  declare bio: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Tweet)
  declare tweets: HasMany<typeof Tweet>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @hasMany(() => Retweet)
  declare retweetsby: HasMany<typeof Retweet>

  // Relations avec Follow (N-N entre utilisateurs)
  @hasMany(() => Follow, { foreignKey: 'followerId' })
  declare following: HasMany<typeof Follow> // utilisateurs que je suis

  @hasMany(() => Follow, { foreignKey: 'followedId' })
  declare followers: HasMany<typeof Follow> // utilisateurs qui me suivent

  // Relations avec Block
  @hasMany(() => Block, { foreignKey: 'blockerId' })
  declare blockedUsers: HasMany<typeof Block>

  public async isBlocking(userId: number): Promise<boolean> {
    const exists = await Block.query()
      .where('blocker_id', this.id)
      .andWhere('blocked_id', userId)
      .first()
    return !!exists
  }

  public async isBlockedBy(userId: number): Promise<boolean> {
    const exists = await Block.query()
      .where('blocker_id', userId)
      .andWhere('blocked_id', this.id)
      .first()
    return !!exists
  }
}

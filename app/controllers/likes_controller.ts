import type { HttpContext } from '@adonisjs/core/http'
import Like from '#models/like'

export default class LikesController {
  public async toggleLike({ auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user)
      return response.unauthorized(
        "Vous n'êtes pas connecté, veuillez vous connecter pour pouvoir liker."
      )

    const tweetId = params.id

    // Vérifie si le user a déjà liké ce tweet
    const existingLike = await Like.query()
      .where('user_id', user.id)
      .where('tweet_id', tweetId)
      .first()

    if (existingLike) {
      await existingLike.delete() // retirer le like
    } else {
      await Like.create({ userId: user.id, tweetId }) // ajouter le like
    }

    return response.redirect().back() // revient à la page précédente
  }
}

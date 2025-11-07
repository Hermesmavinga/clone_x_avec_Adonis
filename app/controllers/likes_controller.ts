import type { HttpContext } from '@adonisjs/core/http'
import Like from '#models/like'
import Tweet from '#models/tweet'

export default class LikesController {
  public async toggleLike({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) return response.unauthorized('Utilisateur non authentifié')

      const tweetId = params.id
      const tweet = await Tweet.find(tweetId)
      if (!tweet) return response.notFound('Tweet introuvable')

      // Vérifier si le like existe déjà
      const existingLike = await Like.query()
        .where('user_id', user.id)
        .andWhere('tweet_id', tweetId)
        .first()

      if (existingLike) {
        // Retirer le like (unlike)
        await existingLike.delete()
        console.log('Like supprimé avec succès')

        return response.redirect().back()
      } else {
        // Créer le like
        await Like.create({ userId: user.id, tweetId: tweetId })
        console.log('Like créé avec succès')

        return response.redirect().back()
      }
    } catch (error) {
      console.error('Erreur toggleLike:', error)
      return response.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors du like/unlike',
      })
    }
  }
}

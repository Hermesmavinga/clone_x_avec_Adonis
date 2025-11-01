import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import Retweet from '#models/retweet'

export default class RetweetsController {
  public async toggleRetweet({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user)
        return response.unauthorized(
          "Vous n'êtes pas connecté, veuillez vous connecter pour pouvoir retweeter."
        )

      const tweetId = params.id
      const tweet = await Tweet.find(tweetId)
      if (!tweet) {
        return response.notFound("Le tweet que vous essayez de retweeter n'existe pas.")
      }
      //   return { user, tweetId }
      // Vérifier si l'utilisateur a déjà retweeté ce tweet
      const existingRetweet = await Retweet.query()
        .where('tweetId', tweetId)
        .andWhere('userId', user.id)
        .first()
      if (existingRetweet) {
        await existingRetweet.delete()
        return response.redirect().toRoute('dashboard')
      } else {
        await Retweet.create({
          userId: user.id,
          tweetId: tweetId,
        })
        return response.redirect().toRoute('dashboard')
      }
    } catch (error) {
      console.error('Erreur lors du toggle retweet :', error)
      return response.internalServerError('Une erreur est survenue lors du retweet.')
    }
  }
}

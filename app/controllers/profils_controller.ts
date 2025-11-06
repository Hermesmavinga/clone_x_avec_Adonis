import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import User from '#models/user'
import Retweet from '#models/retweet'
import Follow from '#models/follow'

export default class ProfilesController {
  /**
   * Profil de l'utilisateur connecté
   */
  public async myProfile({ auth, view }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('followers')
      .preload('following')
      .firstOrFail()

    if (!user) {
      return view.render('pages/auth/login', {
        error: 'Connectez-vous pour voir votre profil.',
      })
    }

    // Tweets écrits par le user
    const tweets = await Tweet.query()
      .where('user_id', user.id)
      .whereNull('parent_id')
      .preload('user')
      .preload('likes')
      .preload('retweetsby')
      .preload('replies')

    // Tweets que le user a retweetés
    const retweetRecords = await Retweet.query()
      .where('user_id', user.id)
      .preload('tweet', (query) => {
        query.preload('user').preload('likes').preload('retweetsby').preload('replies')
      })

    // On transforme les retweets en vrais tweets
    const retweetedTweets = retweetRecords.map((rt) => {
      const t = rt.tweet!
      t.$extras.isRetweet = true
      t.$extras.retweetedBy = user.fullname
      return t
    })

    //Fusion + tri par date
    const allTweets = [...tweets, ...retweetedTweets].sort(
      (a, b) => b.createdAt.toJSDate().getTime() - a.createdAt.toJSDate().getTime()
    )

    return view.render('pages/profil', { user, tweets: allTweets, auth: { user: auth.user } })
  }
}

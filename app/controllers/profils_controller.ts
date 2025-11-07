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

    // Fusion + tri par date
    const allTweets = [...tweets, ...retweetedTweets].sort(
      (a, b) => b.createdAt.toJSDate().getTime() - a.createdAt.toJSDate().getTime()
    )

    // 🔥 AJOUT: Récupérer les suggestions d'utilisateurs
    const suggestions = await this.getUserSuggestions(auth.user!)

    return view.render('pages/profil', {
      user,
      tweets: allTweets,
      auth: { user: auth.user },
      suggestions, // 🔥 N'oubliez pas d'envoyer les suggestions au template
    })
  }

  /**
   * Récupère les suggestions d'utilisateurs à suivre
   */
  private async getUserSuggestions(currentUser: User) {
    // Utilisateurs que l'utilisateur courant suit déjà
    const following = await currentUser.related('following').query().select('followed_id')
    const followingIds = following.map((f) => f.followedId)

    // Ajouter l'ID de l'utilisateur courant pour l'exclure
    followingIds.push(currentUser.id)

    // Récupérer des utilisateurs aléatoires (exclure ceux déjà suivis + soi-même)
    const suggestions = await User.query()
      .whereNotIn('id', followingIds)
      .limit(5)
      .select('id', 'fullname')

    // Ajouter l'info isFollowing pour chaque suggestion
    const suggestionsWithFollowStatus = await Promise.all(
      suggestions.map(async (user) => {
        const isFollowing = await Follow.query()
          .where('follower_id', currentUser.id)
          .andWhere('followed_id', user.id)
          .first()

        return {
          id: user.id,
          fullname: user.fullname,
          isFollowing: !!isFollowing,
        }
      })
    )

    return suggestionsWithFollowStatus
  }

  public async showUserProfile({ params, view, auth }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('followers')
      .preload('following')
      .firstOrFail()

    // Tweets écrits par cet utilisateur
    const tweets = await Tweet.query()
      .where('user_id', user.id)
      .whereNull('parent_id')
      .preload('user')
      .preload('likes')
      .preload('retweetsby')
      .preload('replies')

    // Tweets qu'il a retweetés
    const retweetRecords = await Retweet.query()
      .where('user_id', user.id)
      .preload('tweet', (query) => {
        query.preload('user').preload('likes').preload('retweetsby').preload('replies')
      })

    // Transformation en vrais tweets
    const retweetedTweets = retweetRecords.map((rt) => {
      const t = rt.tweet!
      t.$extras.isRetweet = true
      t.$extras.retweetedBy = user.fullname
      return t
    })

    //Fusion + tri
    const allTweets = [...tweets, ...retweetedTweets].sort(
      (a, b) => b.createdAt.toJSDate().getTime() - a.createdAt.toJSDate().getTime()
    )
    // 🔥 AJOUT: Récupérer les suggestions d'utilisateurs
    const suggestions = await this.getUserSuggestions(auth.user!)

    return view.render('pages/profil', {
      user,
      tweets: allTweets,
      suggestions, // 🔥 N'oubliez pas d'envoyer les suggestions
      auth: { user: auth.user }, // 🔥 Important pour le template
    })
  }
}

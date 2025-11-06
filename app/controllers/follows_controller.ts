import Follow from '#models/follow'
import Tweet from '#models/tweet'
import type { HttpContext } from '@adonisjs/core/http'

export default class FollowsController {
  public async toggleFollow({ auth, params, response, session }: HttpContext) {
    try {
      const followerId = auth.user!.id
      const followedId = Number(params.id)

      if (followerId === followedId) {
        session.flash('error', 'Tu ne peux pas te suivre toi-même')
        return response.redirect().back()
      }

      const follow = await Follow.query()
        .where('follower_id', followerId)
        .andWhere('followed_id', followedId)
        .first()

      if (follow) {
        await follow.delete()
        console.log('Unfollowed successfully')
        session.flash('success', 'Abonnement retiré')
      } else {
        await Follow.create({ followerId, followedId })
        console.log('Followed successfully')
        session.flash('success', 'Utilisateur suivi')
      }

      // 🔥 CORRECTION: Rediriger vers la page précédente
      return response.redirect().back()
    } catch (error) {
      console.error('Error toggling follow status:', error)
      session.flash('error', 'Erreur lors du follow/unfollow')
      return response.redirect().back()
    }
  }
}

// Récupérer tous les followers d'un utilisateur (POUR PAGE HTML)
// public async getFollowers({ params, view, response }: HttpContext) {
//   try {
//     const userId = Number(params.id)

//     const followers = await Follow.query()
//       .where('followed_id', userId)
//       .preload('follower')
//       .orderBy('created_at', 'desc')

//     // 🔥 Retourner une vue HTML au lieu du JSON
//     return view.render('pages/users/followers', {
//       userId,
//       followers: followers.map((f) => f.follower),
//     })
//   } catch (error) {
//     console.error('Error loading followers:', error)
//     return response.redirect().back()
//   }
// }

// Récupérer tous les utilisateurs suivis (POUR PAGE HTML)
// public async getFollowings({ params, view, response }: HttpContext) {
//   try {
//     const userId = Number(params.id)

//     const followings = await Follow.query()
//       .where('follower_id', userId)
//       .preload('followed')
//       .orderBy('created_at', 'desc')

//     // 🔥 Retourner une vue HTML au lieu du JSON
//     return view.render('pages/users/following', {
//       userId,
//       followings: followings.map((f) => f.followed),
//     })
//   } catch (error) {
//     console.error('Error loading followings:', error)
//     return response.redirect().back()
//   }
// }

// Timeline des abonnements
// public async tweetsFollowing({ auth, view, response }: HttpContext) {
//   try {
//     const userId = auth.user!.id

//     // Récupérer les IDs des utilisateurs que le user suit
//     const followings = await Follow.query().where('follower_id', userId).preload('followed')
//     const followingIds = followings.map((f) => f.followed.id)

//     // Récupérer les tweets de ces utilisateurs
//     const tweets = await Tweet.query()
//       .whereIn('user_id', followingIds)
//       .preload('user')
//       .orderBy('created_at', 'desc')

//     // Récupérer des suggestions (utilisateurs non suivis)
//     const followedIds = followingIds.concat(userId)
//     const suggestions = await Follow.query()
//       .whereNotIn('followed_id', followedIds)
//       .preload('followed')
//       .limit(5)

//     console.log('IDs suivis:', followingIds)
//     console.log('Tweets récupérés:', tweets.length)

//     return view.render('pages/timeline', {
//       tweets,
//       suggestions: suggestions.map((s) => s.followed),
//     })
//   } catch (error) {
//     console.error('Erreur récupération tweets followings:', error)
//     return response.redirect().back()
//   }
// }

// // 🔥 NOUVELLE MÉTHODE: Vérifier le statut de follow (pour AJAX)
// public async checkStatus({ auth, params, response }: HttpContext) {
//   try {
//     if (!auth.user) {
//       return response.json({ isFollowing: false })
//     }

//     const follow = await Follow.query()
//       .where('follower_id', auth.user.id)
//       .where('followed_id', Number(params.id))
//       .first()

//     return response.json({ isFollowing: !!follow })
//   } catch (error) {
//     return response.json({ isFollowing: false })
//   }
// }

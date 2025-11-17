import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { promises as fs } from 'fs'
import User from '#models/user'
import Follow from '#models/follow'
import Hashtag from '#models/hashtag'

export default class CreateTweetsController {
  public async store({ request, auth, response }: HttpContext) {
    const content = request.input('content')

    // 🖼️ 1. Récupérer le fichier média
    const media = request.file('media', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'gif', 'mp4'],
    })

    let mediaPath: string | null = null

    // 🧩 2. Vérification du fichier
    if (media) {
      if (!media.isValid) {
        return response.badRequest({ errors: media.errors })
      }

      // 📂 3. Déplacer le fichier dans un dossier permanent
      await media.move(app.publicPath('uploads'), {
        name: `${cuid()}.${media.extname}`,
      })

      // ✅ 4. Enregistrer le nom du fichier
      mediaPath = `uploads/${media.fileName!}`
    }

    // 🐦 5. Créer le tweet (avec ou sans média)
    const tweet = await Tweet.create({
      content,
      mediaPath,
      userId: auth.user!.id,
    })
    // 🔥🔥🔥 AJOUTEZ ICI LE CODE D'EXTRACTION DES HASHTAGS 🔥🔥🔥
    // Extraction des hashtags (#mot)
    const hashtags = (content.match(/#\w+/g) || []).map((tag: string) => tag.toLowerCase())

    if (hashtags.length) {
      for (const tag of hashtags) {
        const texteHashtag = tag.replace('#', '')
        const hashtag = await Hashtag.firstOrCreate({ texteHashtag }, { texteHashtag })
        await tweet.related('hashtags').sync([hashtag.id], false)
      }
    }

    return response.redirect().toRoute('dashboard')
  }

  public async index({ view, auth }: HttpContext) {
    const tweets = await Tweet.query()
      .whereNull('parentId') // Seulement les tweets principaux
      .preload('user')
      .preload('replies', (repliesQuery) => {
        repliesQuery
          .preload('user')
          .preload('likes')
          .preload('hashtags')
          .orderBy('created_at', 'asc')
      })
      .preload('retweetsby')
      .preload('likes')
      .preload('hashtags')
      .orderBy('created_at', 'desc')

    //  LISTE DES USERS SUGGESTION
    const suggestionsUsers = await User.query().whereNot('id', auth.user!.id)
    // ETAT DES USERS SUGGERER
    const suggestionsFollowState = await Promise.all(
      suggestionsUsers.map(async (user) => {
        const isFollowing = await Follow.query()
          .where('followerId', auth.user!.id)
          .andWhere('followedId', user.id)
          .first()
        return {
          ...user.toJSON(),
          isFollowing: !!isFollowing,
        }
      })
    )
    //  Ici on transforme le content en contentClean
    tweets.forEach((tweet) => {
      if (tweet.hashtags && tweet.hashtags.length > 0) {
        let content = tweet.content
        tweet.hashtags.forEach((h) => {
          const regex = new RegExp(`#${h.texteHashtag}`, 'gi')
          content = content.replace(
            regex,
            `<a href="/hashtag/${h.texteHashtag}" class="text-blue-400 hover:underline">#${h.texteHashtag}</a>`
          )
        })
        tweet.contentClean = content
      } else {
        tweet.contentClean = tweet.content
      }
      // contentClean pour les replies
      if (tweet.replies && tweet.replies.length > 0) {
        tweet.replies.forEach((reply: any) => {
          if (reply.hashtags && reply.hashtags.length > 0) {
            let content = reply.content
            reply.hashtags.forEach((h: any) => {
              const regex = new RegExp(`#${h.texteHashtag}`, 'gi')
              content = content.replace(
                regex,
                `<a href="/hashtag/${h.texteHashtag}" class="text-blue-400 hover:underline">#${h.texteHashtag}</a>`
              )
            })
            reply.contentClean = content
          } else {
            reply.contentClean = reply.content
          }
        })
      }
    })

    return view.render('pages/dashboard', {
      user: auth.user,
      tweets, // on envoie les tweets à la vue
      suggestions: suggestionsFollowState,
    })
  }

  public async destroy({ params, auth, response, session }: HttpContext) {
    try {
      const tweet = await Tweet.findOrFail(params.id)

      // Vérifier si l'utilisateur est bien le propriétaire du tweet
      if (tweet.userId !== auth.user!.id) {
        session.flash('errors', { error: 'Action non autorisée' })
        return response.redirect().back()
      }

      // Supprimer le fichier média s'il existe
      if (tweet.mediaPath) {
        const mediaFullPath = app.makePath(tweet.mediaPath)
        try {
          await fs.unlink(mediaFullPath)
        } catch (err) {
          console.warn('⚠️ Impossible de supprimer le fichier média :', err.message)
          // On continue même si la suppression du fichier échoue
        }
      }

      // Supprimer le tweet
      await tweet.delete()

      // Redirection avec message de succès
      session.flash('success', 'Tweet supprimé avec succès')
      return response.redirect().back()
    } catch (error) {
      console.error('Erreur détaillée suppression:', error)

      session.flash('errors', { error: 'Erreur lors de la suppression du tweet' })
      return response.redirect().back()
    }
  }
}

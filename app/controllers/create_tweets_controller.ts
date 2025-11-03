import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { promises as fs } from 'fs'

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
    await Tweet.create({
      content,
      mediaPath,
      userId: auth.user!.id,
    })

    return response.redirect().toRoute('dashboard')
  }

  public async index({ view }: HttpContext) {
    const tweets = await Tweet.query()
      .preload('user')
      .preload('retweetsby')
      .preload('likes')
      .orderBy('created_at', 'desc')

    return view.render('pages/dashboard', { tweets })
  }

  public async destroy({ params, auth, response }: HttpContext) {
    try {
      const tweet = await Tweet.findOrFail(params.id)
      // 🔹 Vérifier si l'utilisateur est bien le propriétaire du tweet
      if (tweet.userId !== auth.user!.id) {
        return response.unauthorized({ message: 'Action non autorisée' })
      }

      // 🔹 Supprimer le fichier média s’il existe
      if (tweet.mediaPath) {
        const mediaFullPath = app.makePath(tweet.mediaPath)
        try {
          await fs.unlink(mediaFullPath)
        } catch (err) {
          console.warn('⚠️ Impossible de supprimer le fichier média :', err.message)
        }
      }
      // 🔹 Supprimer le tweet
      await tweet.delete()

      // 🔹 Retourner une réponse (ou redirection)
      return response.redirect().back()
    } catch (error) {
      return response.internalServerError({ message: 'Erreur lors de la suppression du tweet' })
    }
  }
}

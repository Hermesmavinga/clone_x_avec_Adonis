import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

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
      await media.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${media.extname}`,
      })

      // ✅ 4. Enregistrer le nom du fichier
      mediaPath = 'storage/uploads' + media.fileName!
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
    const tweets = await Tweet.query().preload('user').orderBy('created_at', 'desc')

    return view.render('pages/dashboard', { tweets })
  }
}

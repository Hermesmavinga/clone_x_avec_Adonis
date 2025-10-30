import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'

export default class CreateTweetsController {
  /**
   * Méthode pour créer un nouveau tweet
   */
  public async store({ request, auth, response }: HttpContext) {
    // 1️⃣ On récupère le contenu du tweet envoyé par le formulaire
    const content = request.input('content')

    // 2️⃣ On crée un nouveau tweet lié à l'utilisateur connecté
    await Tweet.create({
      content,
      userId: auth.user!.id, // '!' garantit que user n'est pas nul
    })

    // 3️⃣ Après la création, on redirige vers la route du dashboard
    return response.redirect().toRoute('dashboard')
  }

  /**
   * Méthode pour afficher tous les tweets
   */
  public async index({ view }: HttpContext) {
    // 1️⃣ On récupère tous les tweets, triés du plus récent au plus ancien
    const tweets = await Tweet.query()
      .preload('user') // Charge les infos du user lié à chaque tweet
      .orderBy('created_at', 'desc')

    // 2️⃣ On passe les tweets à la vue Edge (par ex. pages/dashboard.edge)
    return view.render('pages/dashboard', { tweets })
  }
}

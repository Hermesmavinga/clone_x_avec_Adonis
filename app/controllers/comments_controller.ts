import type { HttpContext } from '@adonisjs/core/http'
import Tweet from '#models/tweet'

export default class CommentsController {
  public async reply({ request, auth, params, response }: HttpContext) {
    const user = auth.user
    if (!user) return response.unauthorized('Non authentifié')

    const parentId = params.id
    const content = request.input('content')

    // Création de la réponse
    await Tweet.create({
      content,
      userId: user.id,
      parentId: parentId, // on lie la réponse au parent
    })

    return response.redirect().back() // retour sur la page où on était
  }
}

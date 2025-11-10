// app/middleware/block_check_middleware.ts
import { HttpContext } from '@adonisjs/core/http'
import Block from '#models/block'

export default class BlockCheckMiddleware {
  async handle({ auth, params, response, view }: HttpContext, next: () => Promise<void>) {
    const loggedInUser = auth.user
    const visitedUserId = Number(params.id)

    if (loggedInUser && visitedUserId && loggedInUser.id !== visitedUserId) {
      // Vérifier les blocages mutuels en une seule requête
      const blockExists = await Block.query()
        .where((query) => {
          query.where('blocker_id', loggedInUser.id).andWhere('blocked_id', visitedUserId)
        })
        .orWhere((query) => {
          query.where('blocker_id', visitedUserId).andWhere('blocked_id', loggedInUser.id)
        })
        .first()

      if (blockExists) {
        // Retourner une page d'erreur au lieu d'une redirection
        const html = await view.render('pages/errors/errorblock', {
          message: 'Utilisateur introuvable ou inaccessible',
        })
        return response.status(404).send(html)
        // return view.render('pages/errors/errorblock')
      }
    }

    await next()
  }
}

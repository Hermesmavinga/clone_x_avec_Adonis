import Block from '#models/block'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class BlocksController {
  /**
   * Toggle blocage/déblocage
   */
  public async toggle({ auth, params, response, session }: HttpContext) {
    try {
      const blocker = auth.user!
      const blockedId = Number(params.id)

      // Vérifie qu'on ne se bloque pas soi-même
      if (blocker.id === blockedId) {
        session.flash('error', 'Vous ne pouvez pas vous bloquer vous-même')
        return response.redirect().back()
      }

      const blockedUser = await User.find(blockedId)
      if (!blockedUser) {
        session.flash('error', 'Utilisateur non trouvé')
        return response.redirect().back()
      }

      // Vérifie si le bloc existe déjà
      const existingBlock = await Block.query()
        .where('blocker_id', blocker.id)
        .andWhere('blocked_id', blockedId)
        .first()

      if (existingBlock) {
        await existingBlock.delete()
        session.flash('success', 'Utilisateur débloqué avec succès')
        console.log('Utilisateur débloqué')
      } else {
        await Block.create({ blockerId: blocker.id, blockedId })
        session.flash('success', 'Utilisateur bloqué avec succès')
        console.log('Utilisateur bloqué')
      }

      return response.redirect().back()
    } catch (error) {
      console.error('Erreur toggle block:', error)
      session.flash('error', 'Erreur lors du blocage/déblocage')
      return response.redirect().back()
    }
  }

  /**
   * Liste des utilisateurs bloqués
   */
  //   public async list({ auth, view }: HttpContext) {
  //     try {
  //       const user = auth.user!

  //       // Charger la relation sur l'instance existante
  //       await user.load('blockedUsers', (query: any) => {
  //         query.preload('blocked')
  //       })

  //       // Maintenant user.blockedUsers est disponible
  //       const blockedUsers = user.blockedUsers
  //         .map((block: any) => block.blocked)
  //         .filter((user: any) => user !== null)

  //       return view.render('pages/blocked_users', {
  //         blockedUsers,
  //       })
  //     } catch (error) {
  //       console.error('Error loading blocked users:', error)
  //       return view.render('pages/blocked_users', {
  //         blockedUsers: [],
  //       })
  //     }
  //   }

  /**
   * Vérifier si un utilisateur est bloqué
   */
  //   public static async isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
  //     const block = await Block.query()
  //       .where('blocker_id', blockerId)
  //       .andWhere('blocked_id', blockedId)
  //       .first()

  //     return !!block
  //   }
}

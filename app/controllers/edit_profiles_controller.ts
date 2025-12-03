import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class EditProfilesController {
  /**
   * Met à jour le profil de l'utilisateur
   */
  async update({ request, response, auth, session }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      // Récupérer les données du formulaire
      const data = request.only(['fullname', 'bio', 'location', 'website'])

      // Validation des données
      if (data.fullname && data.fullname.trim()) {
        user.fullname = data.fullname.trim()
      }

      if (data.bio !== undefined) {
        user.bio = data.bio?.trim() || null
      }

      if (data.location !== undefined) {
        user.location = data.location?.trim() || null
      }

      if (data.website !== undefined) {
        user.website = data.website?.trim() || null
      }

      // Gestion des mots de passe
      const currentPassword = request.input('current_password')
      const newPassword = request.input('new_password')
      const confirmPassword = request.input('confirm_password')

      if (newPassword || confirmPassword) {
        // Vérifier si l'utilisateur veut changer son mot de passe
        if (!currentPassword) {
          session.flash('errors', {
            current_password: 'Le mot de passe actuel est requis pour changer le mot de passe',
          })
          return response.redirect().back()
        }

        // Vérifier si le mot de passe actuel est correct
        const isValidPassword = await hash.verify(user.password, currentPassword)
        if (!isValidPassword) {
          session.flash('errors', {
            current_password: 'Le mot de passe actuel est incorrect',
          })
          return response.redirect().back()
        }

        // Vérifier que les nouveaux mots de passe correspondent
        if (newPassword !== confirmPassword) {
          session.flash('errors', {
            new_password: 'Les mots de passe ne correspondent pas',
          })
          return response.redirect().back()
        }

        // Vérifier la longueur du nouveau mot de passe
        if (newPassword.length < 8) {
          session.flash('errors', {
            new_password: 'Le mot de passe doit contenir au moins 8 caractères',
          })
          return response.redirect().back()
        }

        // Mettre à jour le mot de passe
        user.password = newPassword
      }

      // Upload photo de profil (avatarUrl)
      const photoProfil = request.file('avatar', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      })

      if (photoProfil) {
        if (photoProfil.isValid) {
          const fileName = `${cuid()}.${photoProfil.extname}`
          const filePath = `uploads/avatars/${fileName}`

          await photoProfil.move(app.publicPath('uploads/avatars'), {
            name: fileName,
            overwrite: true,
          })

          // Mettre à jour avec le nom de colonne correct (avatarUrl)
          user.avatarUrl = filePath
        } else {
          return response.badRequest(photoProfil.errors)
        }
      }

      // Upload photo de couverture (bannerUrl)
      const coverPicture = request.file('banner', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      })

      if (coverPicture) {
        if (coverPicture.isValid) {
          const fileName = `${cuid()}.${coverPicture.extname}`
          const filePath = `uploads/banners/${fileName}`

          await coverPicture.move(app.publicPath('uploads/banners'), {
            name: fileName,
            overwrite: true,
          })

          // Mettre à jour avec le nom de colonne correct (bannerUrl)
          user.bannerUrl = filePath
        } else {
          return response.badRequest(coverPicture.errors)
        }
      }

      // Sauvegarder les modifications
      await user.save()

      session.flash('success', 'Votre profil a été mis à jour avec succès!')
      return response.redirect().toRoute('profil.view')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)

      // Gestion spécifique des erreurs
      if (error.code === 'E_FILE_VALIDATION_FAILURE') {
        session.flash('errors', {
          files: 'Le fichier est invalide. Vérifiez la taille et le format.',
        })
      } else if (error.code === 'E_CANNOT_WRITE_FILE') {
        session.flash('errors', {
          files: "Erreur d'écriture du fichier. Vérifiez les permissions.",
        })
      } else {
        session.flash('errors', {
          general: 'Une erreur est survenue lors de la mise à jour du profil',
        })
      }

      return response.redirect().back()
    }
  }
}

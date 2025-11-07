import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class SessionController {
  public async loginStore({ request, auth, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const user = await User.verifyCredentials(email, password)
      console.log(user)

      await auth.use('web').login(user)
      response.redirect('/dashboard')
    } catch (error) {
      console.error('utilisateur non trouve')
      console.log('utilisateur non trouve')
    }
  }
}

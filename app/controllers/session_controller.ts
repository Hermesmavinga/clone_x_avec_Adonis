import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class SessionController {
  public async loginStore({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)
    response.redirect('/dashboard')
  }
}

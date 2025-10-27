import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutsController {
  public async storeLogout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/')
  }
}

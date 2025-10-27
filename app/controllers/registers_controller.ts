import type { HttpContext } from '@adonisjs/core/http'
import { SignupValidator } from '#validators/user'
import User from '#models/user'

export default class RegistersController {
  public async createUser({ request, response }: HttpContext) {
    const { fullname, email, password } = await request.validateUsing(SignupValidator)

    await User.create({
      fullname: fullname,
      email: email,
      password: password,
    })
    return response.redirect('/login')
  }
}

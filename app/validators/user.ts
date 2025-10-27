import vine from '@vinejs/vine'

export const SignupValidator = vine.compile(
  vine.object({
    fullname: vine.string().minLength(3).maxLength(100),
    email: vine.string().email(),
    password: vine.string().minLength(6).maxLength(32).confirmed(),
  })
)

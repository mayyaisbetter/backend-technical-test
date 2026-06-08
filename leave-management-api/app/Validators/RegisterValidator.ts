import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({}, [rules.minLength(6)]),
  })

  public messages: CustomMessages = {
    'name.required': 'Name is required',
    'email.required': 'Email is required',
    'email.email': 'Invalid email format',
    'email.unique': 'Email is already registered',
    'password.required': 'Password is required',
    'password.minLength': 'Password must be at least 6 characters long',
  }
}

import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RejectLeaveValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    rejection_reason: schema.string({ trim: true }),
  })

  public messages: CustomMessages = {
    'rejection_reason.required': 'Rejection reason is required',
  }
}

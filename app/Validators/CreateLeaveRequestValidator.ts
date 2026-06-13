import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateLeaveRequestValidator {
  constructor (protected ctx: HttpContextContract) {}

  public schema = schema.create({
    start_date: schema.date({ format: 'yyyy-MM-dd' }),
    end_date: schema.date({ format: 'yyyy-MM-dd' }),
    reason: schema.string({ trim: true }),
    attachment: schema.file({
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'pdf'],
    }),
  })

  public messages: CustomMessages = {
    'start_date.required': 'Start date is required',
    'start_date.date': 'Invalid start date format (must be YYYY-MM-DD)',
    'end_date.required': 'End date is required',
    'end_date.date': 'Invalid end date format (must be YYYY-MM-DD)',
    'reason.required': 'Reason is required',
    'attachment.required': 'Attachment is required',
    'attachment.file': 'Attachment must be a valid file',
    'attachment.size': 'Attachment file must be under 5MB',
    'attachment.extname': 'Attachment must be a PDF, PNG, JPG, or JPEG file',
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'

export default class ExceptionHandler {
  public async handle(error: any, ctx: HttpContextContract) {
    const status = error?.status || 500

    let message = 'Internal Server Error'
    let errors: any = null

    if (error?.code === 'E_VALIDATION_FAILURE' || status === 422) {
      message = 'Validation failed'
      errors = error?.messages?.errors || error?.messages || null
    } else if (status !== 500) {
      message = (error?.message || 'Unexpected error').replace(/^E_[A-Z_]+:\s*/, '').trim()
    }

    if (status === 500) {
      Logger.error(error?.message || error)
    }

    return ctx.response.status(status).send({
      success: false,
      message,
      ...(errors ? { errors } : {}),
    })
  }

  public async report(error: any, _ctx: HttpContextContract) {
    if (error?.status === 500) {
      Logger.error(error?.message || error)
    }
  }
}

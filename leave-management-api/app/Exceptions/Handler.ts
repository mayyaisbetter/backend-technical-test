import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Env from '@ioc:Adonis/Core/Env'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor () {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    // 1. Handle validation validation failures
    if (error.code === 'E_VALIDATION_FAILURE') {
      return ctx.response.status(422).send({
        success: false,
        message: 'Validation failed',
        errors: error.messages?.errors || error.messages,
      })
    }

    // 2. Handle Lucid Model Not Found (e.g. User.findOrFail)
    if (error.code === 'E_ROW_NOT_FOUND' || error.status === 404) {
      return ctx.response.status(404).send({
        success: false,
        message: error.message || 'Resource not found',
      })
    }

    const status = error.status || 500
    const isProd = Env.get('NODE_ENV') === 'production'
    const isServerError = status >= 500

    let message = error.message || 'Internal server error'
    if (isProd && isServerError) {
      message = 'Internal server error'
    } else {
      message = message.replace(/^E_[A-Z_]+:\s*/, '') // Remove code prefix if present
    }

    // Only log actual system/internal server errors (>= 500)
    if (isServerError) {
      Logger.error(error)
    }

    // Return standardized response
    return ctx.response.status(status).send({
      success: false,
      message,
      code: isProd && isServerError ? 'E_INTERNAL_SERVER_ERROR' : (error.code || 'E_INTERNAL_SERVER_ERROR'),
    })
  }
}

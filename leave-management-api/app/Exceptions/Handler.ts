import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

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
    const message = error.message || 'Internal server error'

    // Only log actual system/internal server errors (>= 500)
    if (status >= 500) {
      Logger.error(error)
    }

    // Return standardized response
    return ctx.response.status(status).send({
      success: false,
      message: message.replace(/^E_[A-Z_]+:\s*/, ''), // Remove code prefix if present
      code: error.code || 'E_INTERNAL_SERVER_ERROR',
    })
  }
}

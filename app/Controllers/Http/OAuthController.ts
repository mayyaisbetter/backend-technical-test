import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/fold'
import AuthService from 'App/Services/AuthService'

@inject()
export default class OAuthController {
  constructor (private authService: AuthService) {}

  /**
   * Redirect user to Google OAuth provider
   * GET /api/v1/auth/google/redirect
   */
  public async redirect (ctx: HttpContextContract) {
    const google = ctx.ally.use('google')
    return ctx.response.send({
      success: true,
      message: 'OAuth login successful',
      data: {
        redirectUrl: await google.redirectUrl(),
      },
    })
  }

  /**
   * Handle Google OAuth callback
   * GET /api/v1/auth/google/callback
   */
  public async callback (ctx: HttpContextContract) {
    const google = ctx.ally.use('google')

    if (google.accessDenied()) {
      return ctx.response.unauthorized({
        success: false,
        message: 'OAuth access was denied by the user',
      })
    }

    if (google.hasError()) {
      const error = google.getError()
      return ctx.response.unauthorized({
        success: false,
        message: 'OAuth authentication failed',
        error: error || 'Unknown error',
      })
    }

    const googleUser = await google.user()

    if (!googleUser.email) {
      return ctx.response.badRequest({
        success: false,
        message: 'Email not provided by OAuth provider',
      })
    }

    const ipAddress = ctx.request.ip()
    const userAgent = ctx.request.header('user-agent')

    const { token, user } = await this.authService.handleOAuthLogin(
      'google',
      googleUser.id,
      googleUser.email,
      googleUser.name || googleUser.email.split('@')[0],
      { ipAddress, userAgent }
    )

    return ctx.response.ok({
      success: true,
      message: 'OAuth login successful',
      token,
      user,
    })
  }
}

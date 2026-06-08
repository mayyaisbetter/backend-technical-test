import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from 'App/Services/AuthService'
import RegisterValidator from 'App/Validators/RegisterValidator'
import LoginValidator from 'App/Validators/LoginValidator'

export default class AuthController {
  private authService = new AuthService()

  public async register(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(RegisterValidator)
    const user = await this.authService.register(payload)

    return ctx.response.created({
      success: true,
      message: 'User registered successfully',
      data: user,
    })
  }

  public async login(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(LoginValidator)
    const result = await this.authService.login(payload)

    return ctx.response.ok({
      success: true,
      message: 'Login successful',
      data: result,
    })
  }

  public async me(ctx: HttpContextContract) {
    return ctx.response.ok({
      success: true,
      message: 'User profile retrieved successfully',
      data: ctx.user,
    })
  }
}

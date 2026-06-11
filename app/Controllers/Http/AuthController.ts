import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inject } from '@adonisjs/fold'
import AuthService from 'App/Services/AuthService'
import RegisterValidator from 'App/Validators/RegisterValidator'
import LoginValidator from 'App/Validators/LoginValidator'

@inject()
export default class AuthController {
  constructor (private authService: AuthService) {}

  public async register (ctx: HttpContextContract) {
    const payload = await ctx.request.validate(RegisterValidator)
    const user = await this.authService.register(payload)

    return ctx.response.created({
      success: true,
      message: 'User registered successfully',
      data: user,
    })
  }

  public async login (ctx: HttpContextContract) {
    const payload = await ctx.request.validate(LoginValidator)
    const ipAddress = ctx.request.ip()
    const userAgent = ctx.request.header('user-agent')
    const result = await this.authService.login(payload, { ipAddress, userAgent })

    return ctx.response.ok({
      success: true,
      message: 'Login successful',
      data: result,
    })
  }

  public async me (ctx: HttpContextContract) {
    return ctx.response.ok({
      success: true,
      message: 'User profile retrieved successfully',
      data: ctx.user,
    })
  }
}

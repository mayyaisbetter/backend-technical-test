import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'

export default class JwtAuth {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    const authHeader = ctx.request.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.unauthorized({
        success: false,
        message: 'Unauthorized: Missing or invalid token format',
      })
    }

    const token = authHeader.substring(7)
    let dbUser: User | null = null

    try {
      const secret = Env.get('JWT_SECRET')
      const decoded = jwt.verify(token, secret) as { id: number; email: string }

      dbUser = await User.find(decoded.id)
    } catch (error) {
      return ctx.response.unauthorized({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      })
    }

    if (!dbUser) {
      return ctx.response.unauthorized({
        success: false,
        message: 'Unauthorized: User not found',
      })
    }

    ctx.user = dbUser
    await next()
  }
}

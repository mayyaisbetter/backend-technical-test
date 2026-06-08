import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RoleMiddleware {
  public async handle(
    ctx: HttpContextContract,
    next: () => Promise<void>,
    allowedRoles: string[]
  ) {
    const user = ctx.user
    if (!user) {
      return ctx.response.unauthorized({
        success: false,
        message: 'Unauthorized: User not authenticated',
      })
    }

    if (!allowedRoles.includes(user.role)) {
      return ctx.response.forbidden({
        success: false,
        message: `Forbidden: Access restricted to role(s): ${allowedRoles.join(', ')}`,
      })
    }

    await next()
  }
}

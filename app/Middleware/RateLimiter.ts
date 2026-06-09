import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

interface RateLimitData {
  timestamps: number[]
}

export default class RateLimiter {
  private static clients = new Map<string, RateLimitData>()
  private limit = 10 // Max 10 requests
  private windowMs = 60 * 1000 // 1 minute window

  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const ip = ctx.request.ip()
    const now = Date.now()

    let client = RateLimiter.clients.get(ip)
    if (!client) {
      client = { timestamps: [] }
      RateLimiter.clients.set(ip, client)
    }

    // Filter out timestamps older than the window
    client.timestamps = client.timestamps.filter((timestamp) => now - timestamp < this.windowMs)

    if (client.timestamps.length >= this.limit) {
      return ctx.response.status(429).send({
        success: false,
        message: 'Too many requests. Please try again after a minute.',
      })
    }

    client.timestamps.push(now)
    await next()
  }
}

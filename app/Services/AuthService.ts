import { inject } from '@adonisjs/fold'
import { Exception } from '@poppinss/utils'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'
import { UserRepository } from 'App/Repositories/Contracts/UserRepository'
import AuditLogService from 'App/Services/AuditLogService'
import { Role } from 'App/Enums/Role'

@inject(['App/Repositories/Contracts/UserRepository', 'App/Services/AuditLogService'])
export default class AuthService {
  constructor (
    private userRepository: UserRepository,
    private auditLogService: AuditLogService
  ) {}

  public async register (data: { name: string; email: string; password: string }): Promise<User> {
    const existing = await this.userRepository.findByEmail(data.email)
    if (existing) {
      throw new Exception('Email already exists', 422, 'E_DUPLICATE_EMAIL')
    }

    const hashedPassword = await Hash.make(data.password)
    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: Role.EMPLOYEE,
      leaveBalance: 12,
    })

    return user
  }

  public async login (
    data: { email: string; password: string },
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ token: string; user: User }> {
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      throw new Exception('Invalid email or password', 400, 'E_INVALID_CREDENTIALS')
    }

    if (!user.password) {
      throw new Exception('Invalid email or password', 400, 'E_INVALID_CREDENTIALS')
    }

    const valid = await Hash.verify(user.password, data.password)
    if (!valid) {
      throw new Exception('Invalid email or password', 400, 'E_INVALID_CREDENTIALS')
    }

    const secret = Env.get('JWT_SECRET')
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' })

    await this.auditLogService.log({
      action: 'LOGIN',
      actorId: user.id,
      metadata: { email: user.email },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    })

    return { token, user }
  }

  public async handleOAuthLogin (
    provider: string,
    oauthId: string,
    email: string,
    name: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ token: string; user: User; isNewUser: boolean }> {
    let user = await this.userRepository.findByOauthProvider(provider, oauthId)
    let isNewUser = false

    if (user) {
      await this.auditLogService.log({
        action: 'OAUTH_LOGIN',
        actorId: user.id,
        metadata: { provider, email: user.email },
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      })
    } else {
      user = await this.userRepository.findByEmail(email)

      if (user) {
        user = await this.userRepository.update(user, {
          oauthProvider: provider,
          oauthId: oauthId,
        })
        await this.auditLogService.log({
          action: 'OAUTH_ACCOUNT_LINKED',
          actorId: user.id,
          metadata: { provider, email: user.email },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        })
      } else {
        user = await this.userRepository.create({
          name: name,
          email: email,
          password: null,
          role: Role.EMPLOYEE,
          leaveBalance: 12,
          oauthProvider: provider,
          oauthId: oauthId,
        })
        isNewUser = true
        await this.auditLogService.log({
          action: 'OAUTH_REGISTER',
          actorId: user.id,
          metadata: { provider, email: user.email },
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        })
      }
    }

    const secret = Env.get('JWT_SECRET')
    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    )

    return { token, user, isNewUser }
  }
}

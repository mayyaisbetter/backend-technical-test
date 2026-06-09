import Hash from '@ioc:Adonis/Core/Hash'
import { Exception } from '@poppinss/utils'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import { UserRepository } from 'App/Repositories/Contracts/UserRepository'
import LucidUserRepository from 'App/Repositories/Lucid/UserRepository'

export default class AuthService {
  private userRepository: UserRepository = new LucidUserRepository()

  public async register(data: any): Promise<User> {
    // Hash password using the scrypt default hasher configured in hash.ts
    const hashedPassword = await Hash.make(data.password)
    
    return await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'employee',
      leaveBalance: 12,
    })
  }

  public async login(credentials: any): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(credentials.email)
    if (!user || !user.password) {
      throw new Exception('Invalid email or password', 400, 'E_INVALID_CREDENTIALS')
    }

    const isPasswordValid = await Hash.verify(user.password, credentials.password)
    if (!isPasswordValid) {
      throw new Exception('Invalid email or password', 400, 'E_INVALID_CREDENTIALS')
    }

    const secret = Env.get('JWT_SECRET')
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '24h' }
    )

    return { user, token }
  }
}

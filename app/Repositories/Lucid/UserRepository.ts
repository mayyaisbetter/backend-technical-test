import { UserRepository } from 'App/Repositories/Contracts/UserRepository'
import User from 'App/Models/User'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export default class LucidUserRepository implements UserRepository {
  public async findById (id: number, trx?: TransactionClientContract, lock?: boolean): Promise<User | null> {
    const query = User.query()
    if (trx) {
      query.useTransaction(trx)
    }
    if (lock) {
      query.forUpdate()
    }
    return await query.where('id', id).first()
  }

  public async findByEmail (email: string): Promise<User | null> {
    return await User.findBy('email', email)
  }

  public async findByOauthProvider (provider: string, oauthId: string): Promise<User | null> {
    return await User.query()
      .where('oauth_provider', provider)
      .where('oauth_id', oauthId)
      .first()
  }

  public async create (data: Partial<User>): Promise<User> {
    return await User.create(data)
  }

  public async update (user: User, data: Partial<User>, trx?: TransactionClientContract): Promise<User> {
    if (trx) {
      user.useTransaction(trx)
    }
    user.merge(data)
    await user.save()
    return user
  }
}

import { UserRepository } from 'App/Repositories/Contracts/UserRepository'
import User from 'App/Models/User'

export default class LucidUserRepository implements UserRepository {
  public async findById(id: number, trx?: any): Promise<User | null> {
    const query = User.query()
    if (trx) {
      query.useTransaction(trx)
    }
    return await query.where('id', id).first()
  }

  public async findByEmail(email: string): Promise<User | null> {
    return await User.findBy('email', email)
  }

  public async create(data: any): Promise<User> {
    return await User.create(data)
  }

  public async update(user: User, data: any, trx?: any): Promise<User> {
    if (trx) {
      user.useTransaction(trx)
    }
    user.merge(data)
    await user.save()
    return user
  }
}

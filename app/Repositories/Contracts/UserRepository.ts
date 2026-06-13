import User from 'App/Models/User'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export abstract class UserRepository {
  public abstract findById (id: number, trx?: TransactionClientContract, lock?: boolean): Promise<User | null>
  public abstract findByEmail (email: string): Promise<User | null>
  public abstract findByOauthProvider (provider: string, oauthId: string): Promise<User | null>
  public abstract create (data: Partial<User>): Promise<User>
  public abstract update (user: User, data: Partial<User>, trx?: TransactionClientContract): Promise<User>
}

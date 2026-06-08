import User from 'App/Models/User'

export interface UserRepository {
  findById(id: number, trx?: any): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: any): Promise<User>
  update(user: User, data: any, trx?: any): Promise<User>
}

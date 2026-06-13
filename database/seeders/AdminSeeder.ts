import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { Role } from 'App/Enums/Role'

export default class AdminSeeder extends BaseSeeder {
  public async run () {
    const existing = await User.findBy('email', 'admin@example.com')
    if (existing) {
      console.log('[AdminSeeder] admin@example.com already exists, skipping (idempotent).')
      return
    }

    const hashedPassword = await Hash.make('admin123')

    const user = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      leaveBalance: 12,
    })

    console.log(`[AdminSeeder] Created admin user: ${user.email} (id=${user.id})`)
    console.log(`[AdminSeeder] Password hash length: ${user.password?.length ?? 0}`)
    console.log(`[AdminSeeder] Verify password: ${await Hash.verify(user.password ?? '', 'admin123')}`)
  }
}

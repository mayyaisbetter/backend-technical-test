# Issue #6 — Admin Seeder & Initial Data Setup

## Status: ✅ COMPLETE

## Implementation

`database/seeders/AdminSeeder.ts`:

```typescript
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
```

## Seeded Data

```json
{
  "name": "System Admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin",
  "leave_balance": 12
}
```

## Execution

```bash
$ node ace db:seed
[AdminSeeder] Created admin user: admin@example.com (id=1)
[AdminSeeder] Password hash length: 133
[AdminSeeder] Verify password: true
❯ completed database/seeders/AdminSeeder
```

Re-run (idempotent):
```bash
$ node ace db:seed
[AdminSeeder] admin@example.com already exists, skipping (idempotent).
```

## Verification

```bash
$ curl -X POST http://localhost:3333/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}'
```

Response (HTTP 200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "System Admin",
      "email": "admin@example.com",
      "role": "admin",
      "leave_balance": 12
    }
  }
}
```

## Acceptance Criteria

- ✅ Tersedia AdminSeeder di `database/seeders/AdminSeeder.ts`
- ✅ Seeder membuat akun admin default (verified via login HTTP 200)
- ✅ Password di-hash via `Hash.make('admin123')` (hash length 133, argon2 format)
- ✅ Seeder idempotent (skip if email exists, tested 2x)
- ✅ README updated dengan section "Sample Accounts" (di Issue #3)

# Issue #6 — Admin Seeder & Initial Data Setup

## Background

Saat ini reviewer harus membuat akun admin secara manual melalui database untuk mengakses endpoint approve/reject leave.

Agar proses evaluasi lebih mudah, project harus menyediakan seed data default untuk role Admin.

## Objective

Menyediakan admin default yang dapat langsung digunakan setelah menjalankan migration dan seeder.

## Acceptance Criteria

- [x] Tersedia AdminSeeder
- [x] Seeder membuat akun admin default
- [x] Password di-hash menggunakan Adonis Hash
- [x] Seeder idempotent (tidak membuat duplikat jika dijalankan berulang)
- [x] README diperbarui dengan informasi akun admin default

## Data Seeder

```json
{
  "name": "System Admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin",
  "leave_balance": 12
}
```

## Expected Command

```bash
node ace db:seed
```

## Verification

```bash
POST /api/v1/auth/login
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Expected:

```json
{
  "success": true,
  "token": "..."
}
```

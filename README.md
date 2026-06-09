# 🏖️ Leave Management API

Backend REST API untuk sistem manajemen cuti karyawan, dibangun dengan **AdonisJS v5** + **TypeScript** + **PostgreSQL**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | AdonisJS v5 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Lucid ORM v18 |
| Architecture | Clean / Layered Architecture |
| Authentication | Conventional Auth + OAuth *(coming soon)* |

---

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm >= 8.x

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd leave-management-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` dengan database credentials Anda:

```ini
DB_CONNECTION=pg
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=leave_admin
PG_PASSWORD=secret123
PG_DB_NAME=leave_management_db
```

### 3. Setup Database

```bash
# Buat database (jalankan sekali)
psql postgres -c "CREATE USER leave_admin WITH PASSWORD 'secret123';"
psql postgres -c "CREATE DATABASE leave_management_db OWNER leave_admin;"

# Jalankan migrations
node ace migration:run
```

### 4. Run Development Server

```bash
npm run dev
```

Server berjalan di: `http://localhost:3333`

---

## Available Scripts

```bash
npm run dev          # Start development server (hot reload)
npm run build        # Build production bundle
npm start            # Start production server
npm test             # Run tests
npm run lint         # Check ESLint errors
npm run lint:fix     # Auto-fix ESLint errors
npm run format       # Format code with Prettier
npm run typecheck    # TypeScript type check (no emit)
```

---

## Project Structure

```
leave-management-api/
├── app/
│   ├── Controllers/Http/    ← HTTP request handlers (presentation layer)
│   ├── Exceptions/          ← Global error handler
│   ├── Middleware/          ← HTTP middleware
│   ├── Models/              ← Lucid ORM models (domain layer)
│   ├── Repositories/        ← Data access abstraction
│   │   └── Contracts/       ← Repository interfaces
│   ├── Services/            ← Business logic (application layer)
│   └── Validators/          ← Request validation schemas
├── config/                  ← Framework & package configuration
├── contracts/               ← TypeScript type declarations
├── database/
│   ├── migrations/          ← Database schema migrations
│   └── seeders/             ← Development seed data
├── providers/               ← IoC service providers
├── start/
│   ├── kernel.ts            ← Global middleware registration
│   └── routes.ts            ← API route definitions
└── tests/
    ├── functional/          ← Integration/API tests
    └── unit/                ← Unit tests
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |
| GET | `/api/v1` | API info |

*(More endpoints akan ditambahkan)*

---

## Useful Ace Commands

```bash
# Generate files
node ace make:controller LeaveRequest --resource
node ace make:model LeaveRequest -m
node ace make:migration create_leave_requests_table
node ace make:validator CreateLeaveRequest

# Database
node ace migration:run
node ace migration:rollback
node ace migration:status
node ace db:seed

# Debug
node ace list:routes
node ace repl
```

---

## License

MIT

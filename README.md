# Concert Ticket Reservation System

Full-stack assessment project. Users can browse and reserve free concert tickets.
Admins manage concerts and view reservation history.

## Stack

**Backend** — NestJS, TypeORM, PostgreSQL, JWT, class-validator

**Frontend** — Next.js 16 (App Router), Tailwind CSS v4, axios, sonner

**Infra** — Docker Compose, PostgreSQL 16

## Libraries

| Package                                 | Purpose                                  |
| --------------------------------------- | ---------------------------------------- |
| `@nestjs/jwt` + `passport-jwt`          | JWT auth strategy and token signing      |
| `bcryptjs`                              | Password hashing                         |
| `class-validator` + `class-transformer` | DTO validation and type coercion         |
| `typeorm`                               | ORM + migrations                         |
| `pg`                                    | Postgres driver                          |
| `axios`                                 | HTTP client (frontend → backend)         |
| `jwt-decode`                            | Decode JWT on the client to extract role |
| `sonner`                                | Toast notifications                      |
| `lucide-react`                          | Icons                                    |
| `tailwind-merge` + `clsx`               | Conditional class merging                |

## Architecture

Request flow: `Next.js` → `NestJS Controller` → `Guard (JWT + Role)` → `Service` → `TypeORM` → `PostgreSQL`
Modules are split by domain — `auth`, `users`, `concerts`, `reservations`. Each owns its controller, service, DTOs, and entity. Guards live in `common/guards` and are applied at the controller level. No business logic leaks into controllers.

```
apps/
├── backend/
│   └── src/
│       ├── auth/           # register, login, JWT strategy
│       ├── concerts/       # CRUD, admin-only writes
│       ├── reservations/   # booking + cancel logic
│       ├── users/          # user entity + lookup
│       └── common/         # guards, decorators, enums
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages
        ├── components/     # shared UI components
        └── lib/            # axios client, token utils
```

## Getting Started

### Docker (recommended)

```bash
git clone https://github.com/khawrk/dw-test
cd concert-app
cp apps/backend/.env.example apps/backend/.env
docker compose up --build
```

Migrations run automatically on startup.

- Frontend → http://localhost:3000
- Backend → http://localhost:3001/api

### Local Dev

```bash
# Start Postgres
docker compose up postgres -d

# Backend
cd apps/backend
cp .env.example .env
npm install
npm run migration:run
npm run start:dev

# Frontend (new terminal)
cd apps/frontend
npm install
npm run dev
```

## Environment Variables

```bash
# apps/backend/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=dw-test
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
PORT=3001
```

## First Steps

1. Register an admin account at `POST /api/auth/register/admin` (or via the UI at `/admin/register`)
2. Register a user account at `POST /api/auth/register` (or via `/register`)
3. Log in — the JWT is stored in `localStorage` and sent as a Bearer token on every request

## Roles

Two roles — `ADMIN` and `USER`. Role is embedded in the JWT payload and enforced by `RolesGuard` on every protected route.

## API

```
POST   /api/auth/register
POST   /api/auth/register/admin
POST   /api/auth/login

GET    /api/concerts              # USER + ADMIN
POST   /api/concerts              # ADMIN
DELETE /api/concerts/:id          # ADMIN

POST   /api/reservations          # USER
DELETE /api/reservations/:id      # USER
GET    /api/reservations/my       # USER
GET    /api/reservations/all      # ADMIN
```

## Tests

```bash
cd apps/backend
npm run test        # unit tests
npm run test:cov    # with coverage report
```

Tests cover the reservation service — booking, cancellation, fully-booked rejection, and duplicate booking attempts.

## Bonus

**Performance at scale**

The hottest endpoint is `GET /concerts` — read-heavy and doesn't change that often. I'd throw Redis in front of it with a short TTL (30-60s) via `@nestjs/cache-manager`. On the DB side, a compound index on `reservations(concertId, status)` covers the seat-count queries. Frontend gets deployed behind a CDN with ISR revalidation so most users never hit the origin at all.

**Concurrency / race conditions**

The reservation endpoint uses `SELECT FOR UPDATE` (pessimistic locking) inside a transaction. When 1,000 users hit the last seat simultaneously, Postgres serializes the writes — first one in gets the seat, everyone else sees the updated count and gets a 400.

As a second line of defense, there's a partial unique index on `reservations(userId, concertId) WHERE status = 'ACTIVE'`. A blanket unique constraint would block rebooking after cancellation, so the partial index is the right call — it enforces one active reservation per user per concert at the DB level without preventing a user from rebooking after they cancel.

For truly extreme throughput (10k+ concurrent), I'd move reservations to a BullMQ queue with a single consumer per concert — no lock contention at all.

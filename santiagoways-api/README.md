# santiagoways-api

Next.js 14 (App Router) backend for SantiagoWays.

## Setup

```bash
cp .env.example .env             # fill in DATABASE_URL and JWT secrets
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed              # 3 routes, 80 stages, 30+ albergues, demos
npm run dev                      # http://localhost:3000
```

## Endpoints

```
POST   /api/auth/register         email + name + username + password
POST   /api/auth/login
POST   /api/auth/refresh          rotates refresh token
POST   /api/auth/logout
GET    /api/auth/me               (Bearer)
POST   /api/auth/google           idToken from RN expo-auth-session
POST   /api/auth/apple            stubbed — needs JWKS verification

GET    /api/routes
GET    /api/routes/:slug
GET    /api/stages/:id
GET    /api/stages/:id/albergues

GET    /api/albergues/:id
GET    /api/albergues/:id/availability   RapidAPI Booking
POST   /api/albergues/:id/reviews        (Bearer)

POST   /api/pilgrimages                  (Bearer)
GET    /api/pilgrimages/:id              (Bearer, owner only)
PATCH  /api/pilgrimages/:id              (Bearer, owner only)
POST   /api/pilgrimages/:id/stages/:stageId/complete
POST   /api/pilgrimages/:id/tracks
GET    /api/pilgrimages/:id/tracks

GET    /api/posts                        feed (paginated)
POST   /api/posts                        (Bearer)
GET    /api/posts/:id
DELETE /api/posts/:id                    (Bearer, owner only)
POST   /api/posts/:id/like               (Bearer, toggle)
POST   /api/posts/:id/comments           (Bearer)
POST   /api/posts/:id/bookmark           (Bearer, toggle)

GET    /api/users/:username
POST   /api/users/:id/follow             (Bearer, toggle)
PATCH  /api/users/me                     (Bearer)
PATCH  /api/users/me/location            (Bearer)

GET    /api/notifications                (Bearer)
PATCH  /api/notifications/read-all       (Bearer)
PATCH  /api/notifications/:id/read       (Bearer)

GET    /api/search?q=&type=stages|albergues|users|posts
```

All responses follow `{ data: T }` on success or `{ error: { message, code, details } }` on failure (see `lib/http.ts`). Authenticated routes expect `Authorization: Bearer <accessToken>`. Tokens rotate automatically on 401 via the mobile client.

## Schema

See `prisma/schema.prisma`. 18 models. Refresh tokens are stored hashed; access tokens are JWT (HS256, 15 min default), refresh tokens 30 days.

## Env reference

See `.env.example` and the root `README.md`.

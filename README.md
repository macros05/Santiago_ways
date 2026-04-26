# SantiagoWays

> Tu compañero definitivo del Camino de Santiago — iOS + Android via Expo, Next.js API, PostgreSQL.

Monorepo (npm workspaces) con dos proyectos:

| Path | Qué es |
| --- | --- |
| `santiagoways-app` | Mobile client — Expo SDK 54 / React Native 0.81 / React 19 |
| `santiagoways-api` | Backend — Next.js 15 / Prisma 5 / PostgreSQL 16 |

## Estado del proyecto

✅ **Verificado funcionando en simulador iOS** (iPhone 17, iOS 26.4) y bundle Android exporta limpio.

### Datos en la base de datos (después del seed)
- **7 rutas reales del Camino**: Francés (33 etapas), Portugués (14), del Norte (33), Primitivo (14), Inglés (5), Vía de la Plata (38), Aragonés (7) — **144 etapas en total**.
- **83 albergues** distribuidos a lo largo de las 7 rutas, con tipo (municipal/privado/parroquial), precio, camas, amenities.
- **42 waypoints** de interés (catedrales, fuentes, miradores, zonas de peligro).
- **10 logros** desbloqueables (First Steps, 100km Club, Halfway There, Meseta Survivor, Compostela, Finisterre, Photographer, Mountain Climber, Eternal Pilgrim).
- **12 usuarios demo** de 12 nacionalidades distintas (ES, DE, JP, FR, IE, IT, KR, MX, GB, PL, PT) con bios en sus idiomas.
- **25 posts demo** geolocalizados en distintas etapas, **66 likes**, **13 comentarios**, **28 follows**.
- **11 peregrinaciones demo** activas / completadas / planificando, **37 logros desbloqueados**.

### Cuentas demo

Todas con contraseña `demo1234`:

| Email | Username | Estado |
| --- | --- | --- |
| `maria@example.com` | maria_walks | Caminando Francés (etapa 14) — la principal para probar |
| `tom_pilgrim@example.com` | tom_pilgrim | Caminando Norte (etapa 17) |
| `aiko@example.com` | aiko_jp | Completó el Francés |
| `james@example.com` | james_uk | Caminando Primitivo |
| `sofia@example.com` | sofia_mx | Caminando Vía de la Plata |
| `pierre@example.com` | pierre_le | Caminando Portugués |
| `siobhan@example.com` | siobhan_ie | Completó el Inglés |
| `marco@example.com` | marco_it | Caminando Norte |
| `kim@example.com` | kim_kr | Caminando Francés |
| `helena@example.com` | helena_pl | Planificando Francés |
| `beatriz@example.com` | beatriz_pt | Planificando Aragonés |
| `lucia@example.com` | lucia_cf | Hospitalera, no en Camino |

## Quick start

```bash
# 1. Instalar dependencias del monorepo
npm install

# 2. Levantar PostgreSQL (Docker)
docker run -d --name santiagoways-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=santiagoways \
  -p 5432:5432 postgres:16-alpine

# 3. Copiar fichero de entorno (ya hay uno con valores dev por defecto)
cp .env.example santiagoways-api/.env
cp santiagoways-app/.env.example santiagoways-app/.env

# 4. Migrar y poblar la base de datos
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed

# 5. Arrancar API (terminal A)
npm run api          # http://localhost:3000

# 6. Arrancar la app móvil (terminal B)
npm run app          # Metro server, escanea el QR con Expo Go
npm run app:ios      # arranca directamente en iOS Simulator (necesita Xcode)
npm run app:android  # arranca en Android emulator
```

## Tech stack

### Mobile (`santiagoways-app`)
- **Expo SDK 54** + **React Native 0.81** + **React 19**
- **expo-router 6** — file-based routing con typed routes
- **react-native-reanimated 4** + **react-native-worklets** — animaciones nativas
- **moti** — animaciones declarativas
- **@tanstack/react-query 5** — server state, fetcher con auto-refresh de JWT
- **zustand 4** — client state (auth, toasts)
- **expo-secure-store** — JWT storage (NUNCA AsyncStorage)
- **expo-image** — caching, transitions
- **@shopify/flash-list 2** — listas virtualizadas
- **react-native-maps** — mapa con polylines
- **expo-blur** — backdrops iOS-native
- **expo-haptics** — feedback táctil en cada acción
- **i18n-js** + **expo-localization** — ES/EN

### Backend (`santiagoways-api`)
- **Next.js 15** App Router (solo API routes)
- **Prisma 5** ORM + **PostgreSQL 16**
- **argon2** — password hashing
- **jose** — JWT (HS256, 15min access + 30d refresh con rotación)
- **zod** — validación de body
- **pusher** (instalado, no broadcasting aún)

## Módulos del proyecto

| Módulo | Estado | Notas |
| --- | --- | --- |
| 1. Setup & design system | ✅ | Tokens, theme, librería completa (Button, Card, Avatar, Input, Badge, BottomSheet, Skeleton, Toast, Header, TabBar, MapMarker, StageCard, ProgressRing, KmCounter) |
| 2. Auth & onboarding | ✅ | Email register/login, JWT + refresh rotation, Google ID-token verify, onboarding 5 pantallas, profile setup. Apple Sign In stubbed (501) |
| 3. Explore tab | ✅ | Greeting, hero con progreso real del peregrinaje, próximas etapas, consejo del día, lista de las 7 rutas |
| 4. Map tab | ✅ | MapView con las 7 rutas en colores distintos, leyenda, toggles de capas, marcadores de inicio/fin, Santiago con pulso |
| 5. My Route tab | ✅ | Carga `/api/pilgrimages/me` real. Progress ring, stats grid, timeline vertical de etapas con estados (completada/activa/pendiente) |
| 6. Community tab | ✅ | Feed paginado con React Query infinite scroll, like/bookmark mutations, post detail con comentarios, composer de nuevo post |
| 7. Albergue booking | ⚠️ Parcial | `/api/albergues/:id/availability` llama a RapidAPI Booking. Albergue detail screen lee reviews + amenities. Falta el flujo de booking confirmation |
| 8. Offline mode | ❌ | `expo-sqlite` + `expo-network` instalados; lógica de download/sync pendiente |
| 9. Notifications & real-time | ⚠️ | Backend crea notifications. Push delivery via Expo + broadcasting Pusher pendiente |
| 10. Settings & profile | ⚠️ | Profile screen completa (avatar, stats, achievements, posts grid). Settings rows son placeholders. i18n ES/EN listo |
| 11. Animations & polish | ✅ | Springs en Button/BottomSheet/TabBar/MapMarker/Hero. Empty states con iconos en todos los tabs |
| 12. Backend API | ✅ | Todos los endpoints del spec funcionando + nuevo `GET /api/pilgrimages/me` |
| 13. Data seeding | ✅ | 7 rutas, 144 etapas, 83 albergues, 42 waypoints, 12 usuarios diversos, 25 posts, 66 likes, 28 follows, 37 logros, 11 peregrinaciones |

## Endpoints REST

```
POST   /api/auth/register         email + name + username + password
POST   /api/auth/login
POST   /api/auth/refresh          rotates refresh token
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/google           Google ID token desde RN
POST   /api/auth/apple            stub — pendiente JWKS verification

GET    /api/routes                lista de las 7 rutas
GET    /api/routes/:slug          ruta + sus etapas
GET    /api/stages/:id            etapa + waypoints
GET    /api/stages/:id/albergues  albergues de una etapa

GET    /api/albergues/:id
GET    /api/albergues/:id/availability   RapidAPI Booking
POST   /api/albergues/:id/reviews

POST   /api/pilgrimages           crear nueva
GET    /api/pilgrimages/me        ★ peregrinaje activo del usuario
GET    /api/pilgrimages/:id
PATCH  /api/pilgrimages/:id
POST   /api/pilgrimages/:id/stages/:stageId/complete
POST   /api/pilgrimages/:id/tracks
GET    /api/pilgrimages/:id/tracks

GET    /api/posts                 feed paginado (cursor)
POST   /api/posts
GET    /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/like        toggle
POST   /api/posts/:id/comments
POST   /api/posts/:id/bookmark    toggle

GET    /api/users/:id             acepta id o username
POST   /api/users/:id/follow      toggle
PATCH  /api/users/me
PATCH  /api/users/me/location

GET    /api/notifications
PATCH  /api/notifications/read-all
PATCH  /api/notifications/:id/read

GET    /api/search?q=&type=stages|albergues|users|posts
```

Formato uniforme: `{ data: T }` en éxito, `{ error: { message, code, details } }` en error. Bearer auth con auto-refresh en 401.

## Variables de entorno

Ya hay un `.env.example` con valores dev. Para producción necesitas:

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | PostgreSQL (Hetzner, Railway, Supabase, etc.) |
| `JWT_SECRET` + `JWT_REFRESH_SECRET` | `openssl rand -base64 32` para cada uno |
| `GOOGLE_CLIENT_ID` | OAuth de Google Cloud Console |
| `APPLE_*` | Sign in with Apple (Apple Developer) |
| `CLOUDINARY_*` | Subida de imágenes desde el composer y avatares |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Estilos de mapa custom (terrain, dark) |
| `RAPIDAPI_KEY` | Booking.com availability |
| `PUSHER_*` | Real-time live pilgrim feed |
| `EXPO_ACCESS_TOKEN` | Push notifications via Expo |

Sin estas keys, la app funciona en modo dev: maps con provider nativo, sin push, sin Pusher, sin booking, sin uploads.

## Estructura del repo

```
.
├── santiagoways-api/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/      register, login, refresh, logout, me, google, apple
│   │   │   ├── routes/    list + by slug
│   │   │   ├── stages/    detail + albergues
│   │   │   ├── albergues/ detail, availability, reviews
│   │   │   ├── pilgrimages/ create, /me, detail, complete-stage, GPS tracks
│   │   │   ├── posts/     feed, create, like, comment, bookmark
│   │   │   ├── users/     profile, follow, me update, location
│   │   │   ├── notifications/
│   │   │   └── search/
│   ├── lib/                prisma, jwt, auth, http helpers
│   └── prisma/
│       ├── schema.prisma   18 modelos
│       ├── seed.ts
│       └── data/           routes, albergues, waypoints, achievements, demo
└── santiagoways-app/
    ├── app/                file-based routes (expo-router)
    │   ├── (onboarding)/welcome.tsx
    │   ├── (auth)/         login, register, forgot-password, profile-setup
    │   ├── (tabs)/         explore, route, map, community, profile
    │   ├── stage/[id].tsx
    │   ├── albergue/[id].tsx
    │   └── post/[id].tsx, post/new.tsx
    └── src/
        ├── design/         tokens, theme, Text
        ├── components/     librería completa
        ├── features/onboarding/
        ├── hooks/          usePilgrimage, useMyPilgrimage, useRoute, useRoutes, usePosts
        ├── lib/            api (auto-refresh), queryClient, i18n, format
        └── stores/         auth, toast (zustand)
```

## Desarrollo

```bash
# Typechecking
npm run typecheck

# Migraciones nuevas
cd santiagoways-api && npx prisma migrate dev --name <name>

# Resetear y re-seedear DB
cd santiagoways-api && npx prisma migrate reset --force

# Bundle iOS production (validation)
cd santiagoways-app && npx expo export --platform ios --output-dir .expo-export
```

## Convenciones

- TypeScript estricto, `noUncheckedIndexedAccess`, sin `any`.
- Todos los API calls van por `src/lib/api.ts` → React Query hooks. Nada de `fetch` en componentes.
- Visual design siempre referencia `src/design/tokens.ts`. Nunca hex codes hardcoded.
- Listas con `FlashList`, no `FlatList`.
- Imágenes con `expo-image`, no `Image` de RN.
- JWT en `expo-secure-store`, jamás AsyncStorage.

## Lo que falta para producción

1. **Subida de imágenes** a Cloudinary (composer manda `images: []` ahora mismo).
2. **Pusher broadcasts** — backend escribe localización, falta el `pusher.trigger()` al canal.
3. **Background GPS tracking** — `expo-task-manager` + UX start/stop en el FAB del Map.
4. **Offline downloads** — `expo-sqlite` cache + Mapbox tiles para etapas descargadas.
5. **Apple Sign In JWKS** — actualmente devuelve 501.
6. **Daily push 07:00** — Expo notification + cron (Vercel cron / EAS jobs).
7. **Settings funcionales** — placeholders en el Profile tab.
8. **Iconos y splash** — actualmente faltan los PNGs (`assets/icon.png`, etc.). Expo usa defaults.
9. **Booking flow real** — la API de availability funciona, falta el wizard de 3 pasos.

Cada uno es un workstream aislado.

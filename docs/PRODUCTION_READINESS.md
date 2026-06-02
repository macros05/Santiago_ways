# SantiagoWays — Auditoría de producción

_Última actualización: 2026-06-02 · Rama: `claude/production-readiness-review`_

Este documento es la **fuente de verdad** sobre cuán cerca está SantiagoWays de
lanzarse. Sustituye al antiguo `PRODUCCION.md` (que sigue siendo válido para el
contexto del rediseño "Liquid Dawn", pero su checklist quedó desactualizado).

> **Veredicto en una línea:** el proyecto está **técnicamente maduro** — la base
> de código, la seguridad del backend y la infraestructura están a nivel de
> producción. Lo que separa al proyecto de la tienda **no es código, es
> configuración, cuentas externas, contenido legal y verificación en
> dispositivo físico**. Estimación realista: **2–4 semanas** de trabajo de
> integración + revisión de tiendas, no meses.

---

## 0. TL;DR — Semáforo

| Área | Estado | Comentario |
|---|---|---|
| Arquitectura & código | 🟢 | Monorepo limpio, TS estricto, separación API/app correcta |
| Seguridad backend | 🟢 | Rate-limit, CSP/HSTS, JWT con rotación, webhook firmado, cron protegido |
| Infraestructura / deploy | 🟢 | Stack Docker (Postgres + API + Caddy HTTPS), healthchecks, `eas.json` |
| Cobertura de features | 🟢 | Mucho más completo de lo que dice el README viejo |
| Tests automatizados | 🟠 | 10 suites / 61 tests de libs del cliente (ampliado en esta rama); 0 tests de API |
| Observabilidad | 🔴 | Sin Sentry/error-tracking ni métricas |
| Config de release | 🟠 | `version` → **`1.0.0`** (hecho); falta `eas init` (projectId) y `EXPO_PUBLIC_API_BASE_URL` |
| Páginas legales | 🟠 | `/terms` y `/privacy` **creadas** en esta rama; faltan rellenar datos de empresa y publicarlas en el dominio |
| Pagos (RevenueCat) | 🔴 | Productos sin crear en App Store / Play; sin API keys |
| Push remoto | 🟠 | Solo notificaciones **locales**; no hay envío server→dispositivo |
| Verificación en dispositivo | 🔴 | Nada probado en iPhone/Android físico (GPS background, compras, offline) |
| Seed de producción | 🟢 | **Corregido en esta rama** — guarda contra `clear()` y cuentas demo en prod |

---

## 1. Lo que YA está a nivel de producción (puntos fuertes)

No subestimar esto: el grueso del trabajo difícil está hecho.

### Seguridad del backend (`santiagoways-api`)
- **Rate limiting** en las 7 rutas de auth (`login`, `register`, `refresh`,
  `google`, `apple`, `forgot-password`, `reset-password`) + 15 rutas en total.
  Two-tier: Upstash Redis distribuido en prod, fallback en memoria en dev.
- **Cabeceras de seguridad** en `next.config`: HSTS con preload, CSP completa,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Permissions-Policy.
- **JWT** con `jose` (HS256): access 15 min + refresh 30 d **con rotación** y el
  refresh se guarda **hasheado** (SHA-256), no en claro.
- **Argon2** para passwords.
- **Webhook de RevenueCat** verifica firma (`x-revenuecat-signature`) y rechaza
  401 si no coincide.
- **Cron** (`/api/cron/gps-retention`) protegido con `Bearer ${CRON_SECRET}`.
- **Validación de entorno** (`lib/env.ts`): falla ruidosamente en prod si faltan
  `DATABASE_URL`/`JWT_SECRET`/`JWT_REFRESH_SECRET`; avisa (sin romper) de las
  integraciones opcionales.
- **Validación de body** con Zod en los endpoints.

### Infraestructura
- **Stack Docker autohospedado** (`docker-compose.yml`): Postgres 16 + API +
  Caddy (HTTPS automático). Volumen persistente, `restart: unless-stopped`,
  healthchecks en API y DB. `DATABASE_URL` derivada de `POSTGRES_*`.
- **`eas.json`** con perfiles `development`, `development-simulator`, `preview`,
  `production` (auto-increment, `appVersionSource: remote`).
- **CI** (`.github/workflows/ci.yml`): typecheck + tests en cada PR a `main`.
- **`.env.production.example`** presente como plantilla.

### Cobertura funcional (mucho mayor que el README "oficial")
El backend tiene **67 rutas API**. Más allá del CRUD base, ya existen en código:
- **Diario del peregrino** (CRUD + compartir público por token).
- **Credencial digital** con sellos validados por GPS (≤ 200 m) y elegibilidad
  de Compostela.
- **Tracking GPS** foreground **y background** (`backgroundTask.ts`,
  `startLocationUpdatesAsync`), buffer SQLite que sobrevive reinicios, detección
  off-route, export GPX.
- **Suscripciones / RevenueCat** (cliente `purchases.ts` + webhook + sync).
- **Subida de imágenes** a Cloudinary cableada (`uploads.ts`) — el README viejo
  decía que el composer mandaba `images: []`; **ya no es cierto**.
- **AI guide** (`/api/ai/recommendations`, Gemini), **chat** (rooms + messages),
  **health dashboard**, **grupos** de peregrinación, **info práctica**,
  **companions nearby**, **stats/peers**, **analytics batched**.
- **Apple Sign In** **implementado** (ya no devuelve 501).
- **i18n** ES/EN + frases en 6 idiomas para la sección práctica.
- **Fuentes** cargadas correctamente vía `@expo-google-fonts/fraunces` (no hay
  bug de fuente faltante).

---

## 2. 🔴 Bloqueantes reales para publicar

Ninguno es "difícil"; son tareas de configuración/contenido que **solo tú**
puedes completar (requieren cuentas, dominios, decisiones legales).

1. ~~**Versión `0.1.0`**~~ → **HECHO**: subida a `1.0.0` en todos los manifests.
   EAS gestiona `buildNumber`/`versionCode` (remote).
2. **`extra.eas.projectId` vacío** en `app.json`. Ejecutar `eas init` para
   generarlo (necesario para builds de tienda y OTA).
3. **`extra.apiBaseUrl = http://localhost:3000/api`**. En los builds de
   producción hay que definir **`EXPO_PUBLIC_API_BASE_URL`** apuntando al backend
   desplegado. Mientras siga en localhost, la app **no carga datos** en el móvil.
4. **Páginas legales** → **CREADAS** en esta rama (`app/(legal)/terms`,
   `/privacy`). Falta: (a) rellenar los placeholders `[COMPANY NAME]`/
   `[CONTACT EMAIL]`/`[ADDRESS]`/`[JURISDICTION]`, (b) revisión legal, y
   (c) **publicarlas en el dominio `santiagoways.app`** que enlaza el paywall
   (hoy el Next app se despliega como `api.santiagoways.app`). Apple/Google
   exigen estas URLs accesibles.
5. **RevenueCat sin productos.** Hay que crear las ofertas (p. ej. `buen_camino`,
   `compostelero` mensual/anual) en App Store Connect + Google Play Console y en
   el dashboard de RevenueCat, y rellenar las API keys. Sin esto el paywall no
   compra.
6. **Secretos sin rellenar** (`.env.production.example`): `DATABASE_URL`,
   `JWT_SECRET`, `JWT_REFRESH_SECRET`, `REVENUECAT_WEBHOOK_SECRET`,
   `GOOGLE_CLIENT_ID`, `APP_PUBLIC_URL`, y los opcionales (Apple, Cloudinary,
   Resend, Pusher, Upstash, RapidAPI).
7. **Sin verificación en dispositivo físico.** GPS en background durante una
   etapa real, llegada de notificaciones, compras reales, modo avión/offline:
   **nada de esto se ha probado en hardware**. Es obligatorio antes del release.

---

## 3. 🟠 Importante (calidad / cumplimiento / fiabilidad)

8. **Push remoto no cableado.** Existe el modelo `Notification` y las
   notificaciones **locales** (recordatorios diarios, cierre de albergue), pero
   **no hay registro de Expo push token en el cliente ni envío server-side**
   (no está `expo-server-sdk` en el backend). Las notificaciones que dependen de
   un evento de servidor (te siguió alguien, comentario, etc.) **no llegan al
   dispositivo**. Para el MVP las locales bastan; planifícalo para v1.1.
9. **Tests escasos.** Solo 6 tests de libs del cliente (`geo`, `gpx`,
   `analytics`, `tokens`, `withTimeout`, `backgroundTask`). **Cero tests de las
   67 rutas de API** y cero tests de componentes. El CI no corre lint del API y
   `eslint.ignoreDuringBuilds: true` desactiva lint en el build de Next.
10. **Sin observabilidad.** No hay Sentry/Crashlytics ni logging estructurado.
    En producción un crash o un 500 pasa inadvertido. Añadir Sentry (cliente +
    API) es de las primeras cosas tras el lanzamiento.
11. **Permiso de background-location:** Apple rechaza con frecuencia apps que
    piden "Always location" sin justificación clara. Asegúrate de que la ficha y
    el copy in-app expliquen el porqué (tracking de la etapa con pantalla
    apagada).
12. **Icono de notificación Android:** debe ser blanco sobre transparente; si el
    generado tiene fondo, se verá como un cuadrado.
13. **Datos hard-coded:** `/api/practical/emergencies` devuelve contactos en
    código; moverlos a DB cuando crezca.
14. **CSP:** `connect-src` referencia `api.openweathermap.org` pero el cliente
    usa Open-Meteo; revisar que la CSP de la web no bloquee llamadas legítimas
    (no afecta a la app nativa, sí a la versión web).

---

## 4. 🟢 Resuelto en esta rama

- **Seed seguro en producción.** `prisma/seed.ts` ahora **se niega** a correr el
  `clear()` destructivo en `NODE_ENV=production` salvo `SEED_ALLOW_DESTRUCTIVE=true`,
  y **nunca** crea las 12 cuentas demo (`demo1234`) en prod salvo `SEED_DEMO=true`.
  En prod, por defecto, solo se siembran datos de referencia (rutas, etapas,
  albergues, waypoints, logros). Esto cierra un agujero real: cuentas con
  contraseña pública y el riesgo de borrar datos de peregrinos reales.
- **Versión `1.0.0`** en root, app, api y `app.json` (antes `0.1.0`).
- **Páginas legales** `/terms` y `/privacy` creadas como rutas Next.js
  (`app/(legal)/`), enlazadas desde la landing del API. Cubren lo que la app
  realmente recoge (ubicación incl. background, fotos, salud, GPS, diario,
  suscripciones) e incluyen un disclaimer de seguridad ("no es un dispositivo de
  navegación/emergencia"). **Pendiente:** rellenar `[COMPANY NAME]`,
  `[CONTACT EMAIL]`, `[ADDRESS]`, `[JURISDICTION]`, revisión legal y publicarlas
  en `santiagoways.app` (el dominio que enlaza el paywall).
- **CSP corregida**: `connect-src` apuntaba a `api.openweathermap.org`; el
  cliente usa Open-Meteo. Eliminado el host muerto.
- **Cobertura de tests ampliada**: nuevos tests de `format`, `dailyQuote`,
  `achievements` y `compostela` (incluye prueba de **escape XSS** en la
  generación del HTML de la Compostela). Suite: 61 tests en verde.

### Segunda pasada — auditoría de seguridad + UX (esta rama)

Tras una auditoría profunda (backend + cliente), corregido:

**Seguridad (API):**
- 🔴 **Escalada de privilegios en `subscriptions/sync`**: cualquier usuario
  podía pasar el `revenueCatCustomerId` de otro (expuesto como id de usuario) y
  copiarse sus entitlements → premium gratis. Ahora el id se deriva de `auth.sub`
  y nunca se confía en el cuerpo.
- 🔴 **Fuga de errores internos**: `handleApiError` devolvía `e.message` en los
  500 (detalles de Prisma, cuerpos de Gemini/RevenueCat). Ahora loguea
  server-side y devuelve un 500 genérico.
- 🟠 **`ai/recommendations` sin rate-limit** (endpoint de pago, Gemini): añadido
  `RATE_AI` (10/min por usuario) para frenar abuso de coste.
- 🟠 **Reseñas de albergue**: sin comprobar existencia, sin límite y con
  duplicados ilimitados (manipulación de rating). Ahora: comprueba existencia,
  rate-limit, y `@@unique([userId, albergueId])` + upsert (con migración que
  deduplica de forma segura).
- 🟡 **Replay de refresh token**: al reusar un token ya rotado, se revoca toda
  la familia del usuario (detección de robo), no solo se rechaza.
- 🟡 **Secreto de cron** comparado con `timingSafeEqual`.

**Correctitud / UX (app):**
- 🔴 **Like/bookmark** sin update optimista ni feedback de error: cada toque
  refetcheaba todo el feed (lag/flicker) y los fallos eran silenciosos. Ahora
  update optimista con rollback + toast y reconciliación con el servidor (sin
  refetch del feed completo).
- 🔴 **URL pública del diario** se construía con `replace('/api','')` (rompía
  hosts como `api.santiagoways.app` y apuntaba a localhost en dev). Ahora usa
  `EXPO_PUBLIC_WEB_URL` o quita solo el `/api` final.
- 🔴 **`restore()` de compras** sin `catch` → posible unhandled rejection. Ahora
  captura y muestra toast.
- 🟠 **Listas (community, diary)** mostraban "vacío" en error en vez de
  error+reintento. Añadida rama `isError` con botón de reintento.
- 🟠 **Chat** hacía auto-scroll al fondo al cargar mensajes **antiguos** (rompía
  la paginación). Ahora solo baja cuando llega un mensaje nuevo al final.
- 🟡 **`signOut`** no limpiaba la caché de React Query → el siguiente usuario
  podía ver datos del anterior. Añadido `queryClient.clear()`.

### Documentado pero NO resuelto (deuda priorizada para el siguiente sprint)
- **i18n en pantallas críticas**: `plans.tsx` (paywall) y `profile.tsx` tienen
  textos en español hardcodeados que ignoran `t()` → un usuario en inglés ve el
  paywall en español. Extraer a claves `plans.*`/`profile.*`. (Alta — es una
  pantalla de ingresos.)
- **Colores hardcodeados** fuera de `tokens.ts` en `ads/HomeBanner.tsx`,
  `profile.tsx`, `diary/index.tsx`, `(auth)/_layout.tsx`. Mover a tokens.
- **Etapa marcada como completada al pulsar "Parar"** sin validar distancia
  recorrida ni proximidad al final (`stage/[id].tsx`). Gatear por % de
  `distanceKm` o cercanía al endpoint.
- **Accesibilidad**: algunos `Pressable` de iconos (login, diary detail) sin
  `accessibilityLabel`/`Role`.
- **Next.js**: quedan advisories que solo se cierran en **Next 16** (major).
  Se subió al último parche 15.5.19; planificar el salto a 16 con pruebas.
- **`npm audit`**: ~24 vulns, la mayoría en tooling de build (xcode/xmldom/uuid),
  bajo riesgo en runtime. `ws` y otras moderadas se cierran con `npm audit fix`.

---

## 5. Camino a producción (orden recomendado)

```
SEMANA 1 — Backend en línea
  □ Provisionar Postgres + servidor (Hetzner/Railway) y dominio api.santiagoways.app
  □ Rellenar .env.production (DB, JWT x2, CRON_SECRET, Upstash)
  □ docker compose up -d --build  →  prisma migrate deploy
  □ Sembrar referencia:  SEED_ALLOW_DESTRUCTIVE=true npm run db:seed   (sin SEED_DEMO)
  □ Verificar GET /api/health en verde
  □ Conectar Sentry (API)

SEMANA 1-2 — Integraciones externas
  □ Google OAuth (client id), Apple Sign In (key/team), Cloudinary, Resend, Pusher
  □ RevenueCat: crear productos en App Store Connect + Play Console + keys
  □ Publicar /terms y /privacy (páginas reales y accesibles)

SEMANA 2 — App de release
  □ eas init  → rellenar projectId
  □ Subir version a 1.0.0
  □ EXPO_PUBLIC_API_BASE_URL = https://api.santiagoways.app/api  (+ Mapbox, RevenueCat)
  □ eas build --profile production  (iOS + Android)
  □ Revisar icono/splash/notification-icon y screenshots de tienda

SEMANA 2-3 — Verificación en dispositivo (OBLIGATORIO)
  □ TestFlight + Play Internal Testing
  □ Probar en iPhone y Android físicos: GPS background en una etapa de 4-6 h,
    compra real de suscripción, login Google/Apple, offline/modo avión,
    notificaciones locales, subida de fotos
  □ Perfil de batería con tracking real

SEMANA 3-4 — Envío a tiendas
  □ App Privacy / Data Safety forms (declarar ubicación, fotos, etc.)
  □ eas submit → revisión de Apple/Google (1-7 días)
  □ Plan de soporte: email, FAQ, página de estado
```

---

## 6. Auditoría de mejora (deuda técnica priorizada)

| Prioridad | Mejora | Por qué |
|---|---|---|
| Alta | Sentry en API + app | Sin esto vuelas a ciegas en prod |
| Alta | Tests de integración de rutas API críticas (auth, pilgrimages, gps, subscriptions/webhook) | 67 rutas con 0 cobertura |
| Alta | Páginas legales reales + formularios de privacidad de tienda | Bloqueante + cumplimiento |
| Media | Push remoto (Expo push token + `expo-server-sdk`) | Notificaciones sociales no llegan |
| Media | Reactivar lint en CI para el API y quitar `ignoreDuringBuilds` cuando el resolver esté arreglado | Calidad |
| Media | Mover `emergencies` y otros datos hard-coded a DB | Mantenibilidad |
| Media | Visor de mapa offline real (mbtiles servidos localmente) | `offline.ts` descarga pero el visor sigue online |
| Baja | Tests de componentes + e2e (Maestro/Detox) | Regresiones de UI |
| Baja | Backups automatizados de Postgres + runbook de restore | Continuidad |
| Baja | Web SEO (landing real con rutas/posts públicos) | Adquisición orgánica |

Backlog de producto detallado: ver `PENDIENTES.md`.
</content>

# SantiagoWays — Auditoría de producción y rediseño "Liquid Dawn"

_Última actualización: 2026-05-28_

Este documento resume (1) el rediseño estético aplicado, (2) el estado de salud
técnico del proyecto, (3) los bloqueantes reales para publicar en tiendas, y
(4) **la lista exacta de pasos que tienes que hacer tú**.

---

## 1. Rediseño estético — "Liquid Dawn" (Apple liquid glass + alma del Camino)

Concepto: el amanecer del peregrino renderizado como cristal líquido. Base
obsidiana, auroras de luz (azul pre-alba fundiéndose con el oro del amanecer),
superficies de vidrio esmerilado flotando sobre un campo de gradiente atmosférico,
iconografía de la vieira en oro luminoso, bordes finísimos que atrapan la luz y
sombras de profundidad con glow ámbar.

**Sistema de diseño (toca todas las pantallas a la vez):**
- `src/design/tokens.ts` — nueva paleta aurora (`ink`, `night`, `twilight`,
  `horizon`, `aurora1/2/3`…), tokens de **vidrio** (`glassFill`, `glassBorder`,
  `glassHighlight`…), **gradientes** (`dawn`, `sunrise`, `aurora`, `gold`,
  `glassSheen`), sombras **glow** de color y escala de **tracking** óptico.
- Tipografía: **Fraunces** (serif editorial con alma) para los display + **fuente
  del sistema** (SF Pro / Roboto) para UI/cuerpo. Esto, además, **arregla un bug
  latente**: la app referenciaba `PlayfairDisplay`/`DMSans` que **nunca se
  cargaban** (no existían en `assets/fonts`), así que caía a la fuente del sistema
  sin querer. Ahora es intencional y Fraunces se carga de verdad.
- `src/design/text.tsx` — variantes con pesos y tracking estilo Apple + nueva
  variante `overline` (eyebrow en mayúsculas).

**Componentes nuevos / reconstruidos:**
- `Glass` — superficie de vidrio reutilizable (BlurView + tinte + sheen + borde).
- `AuroraBackground` — fondo ambiental de gradiente con blooms de color.
- `Button` — primario con gradiente *sunrise* y glow ámbar; variante `glass`.
- `Card` — añadida elevación `glass`; bordes que atrapan la luz.
- `TabBar` — vidrio más intenso + píldora activa con gradiente.
- `Header`, `Input`, `Badge`, `BottomSheet` — alineados al lenguaje de vidrio.

**Pantallas rediseñadas:** onboarding (3 slides con imágenes cinemáticas
generadas), home/`explore`, `login`, `plans` (paywall con tarjetas translúcidas),
y base `ink` unificada en toda la app.

**Imágenes generadas con Gemini** (`gemini-3-pro-image-preview`) en
`santiagoways-app/assets/generated/` y como icono/splash:
`icon`, `adaptive-icon`, `splash`, `onboarding-hero/routes/community`,
`aurora-bg`, `notification-icon`. El script reproducible está en
`scripts/gen-assets.mjs` (requiere `GEMINI_API_KEY`).

---

## 2. Estado de salud técnico (verificado)

| Check | App | API |
|---|---|---|
| `tsc --noEmit` | ✅ verde | (no tocado este sprint) |
| `eslint` | ✅ verde | — |
| `jest` | ✅ verde | — |

> ⚠️ **No verificado en runtime en dispositivo** (limitación del entorno): que el
> bundle de Metro arranque sin error en el móvil, tracking GPS en background,
> llegada real de notificaciones, modo avión/offline. Recomendado: probar en
> iPhone y Android físicos antes del release (ver pasos abajo).

---

## 3. Auditoría de producción — bloqueantes y recomendaciones

### 🔴 Bloqueantes para publicar
1. **`version` = `0.1.0`** en `app.json`. Súbela a `1.0.0` para el primer release
   y configura `ios.buildNumber` / `android.versionCode`.
2. **EAS sin configurar**: `extra.eas.projectId` está vacío y no hay `eas.json`.
   Necesario para builds de tienda y para OTA updates.
3. **`apiBaseUrl` = `http://localhost:3000/api`** (en `extra`). En producción debe
   apuntar al backend desplegado vía `EXPO_PUBLIC_API_BASE_URL`. Mientras esté en
   localhost, las pantallas que dependen de la API no cargarán datos en el móvil.
4. **Variables de entorno / secretos** (ver `.env.example`): faltan por rellenar
   en el backend y en el build del cliente:
   - Backend: `DATABASE_URL`, `NEXTAUTH_SECRET`, `JWT_SECRET`,
     `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `MAPBOX_ACCESS_TOKEN`, `PUSHER_*`,
     `GOOGLE_CLIENT_ID/SECRET`, `APPLE_*`, `RAPIDAPI_KEY`.
   - Cliente (`EXPO_PUBLIC_*`): `EXPO_PUBLIC_API_BASE_URL`,
     `EXPO_PUBLIC_MAPBOX_TOKEN`, claves de RevenueCat.
5. **Pagos (RevenueCat)**: hay que crear los productos/ofertas `buen_camino` y
   `compostelero` (mensual/anual) en App Store Connect + Google Play Console y en
   el dashboard de RevenueCat, y poner las API keys. Sin esto el paywall no compra.
6. **Páginas legales**: el paywall enlaza a `https://santiagoways.app/terms` y
   `/privacy`. Esas URLs deben existir y estar publicadas (Apple lo exige).

### 🟠 Importante (calidad / cumplimiento)
7. **Permisos**: las descripciones de iOS (`infoPlist`) y permisos Android ya están
   declarados. Revisa que background-location esté **realmente justificado** en la
   ficha de Apple (motivo de rechazo común).
8. **`notification-icon`**: en Android el icono de notificación debe ser blanco
   sobre transparente. El generado tiene fondo; si se ve como cuadrado, usa el
   anterior o genera una silueta plana transparente.
9. **Icono adaptativo Android**: el foreground generado lleva fondo oscuro propio;
   funciona, pero lo ideal es un foreground con transparencia real.

### 🟡 Backlog de producto (ver `PENDIENTES.md`)
- Background GPS real, sellos por QR (`expo-camera`), mapas offline con MapLibre +
  `.mbtiles`, validación de etapa por GPS, PDF de la Compostela, comparativa con la
  media de peregrinos, free-trial visible y wire-up del soft-paywall analytics.

---

## 4. ✅ Pasos que tienes que hacer TÚ

### A) Ver la app ahora mismo (preview)
- Esta app **NO corre en Expo Go** (usa módulos nativos: MapLibre, Health,
  Purchases, Apple Auth…). Necesitas un **dev client** de SantiagoWays instalado en
  tu móvil.
- Si ya lo tienes: escanea el QR que te he enviado (servidor `expo start --tunnel`).
- Si **no** lo tienes, créalo una vez (15–40 min, requiere cuenta Expo):
  ```bash
  npm i -g eas-cli && eas login
  cd santiagoways-app && eas build --profile development --platform ios   # o android
  ```
  Instálalo y a partir de ahí el QR del túnel ya te abrirá la app.

### B) Camino a producción (orden recomendado)
1. `eas login` y `eas init` para generar `eas.json` + `projectId`.
2. Rellena `EXPO_PUBLIC_API_BASE_URL` con el backend desplegado y todos los
   secretos del backend (Postgres, JWT, Cloudinary, Mapbox, Pusher, OAuth).
3. Despliega el backend (`santiagoways-api`, Next 15 + Prisma): migraciones
   (`prisma migrate deploy`) y variables de entorno en el hosting.
4. Configura RevenueCat + productos en App Store Connect y Google Play.
5. Publica las páginas legales (terms/privacy).
6. Sube `version` a `1.0.0`; revisa icono/splash/screenshots de tienda.
7. `eas build --profile production` para iOS y Android; prueba en dispositivo
   físico (GPS background, notificaciones, compras, offline).
8. `eas submit` a TestFlight / Play Internal Testing antes del lanzamiento.

---

## 5. Reproducir la generación de imágenes
```bash
GEMINI_API_KEY=tu_clave node scripts/gen-assets.mjs
```
Genera todos los assets de marca en `santiagoways-app/assets/generated/`.

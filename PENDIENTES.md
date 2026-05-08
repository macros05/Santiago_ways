# SantiagoWays — Backlog para el siguiente sprint

Generado tras el sprint de mejoras de producto y experiencia (commit posterior a 2e7bbc4).

## Lo que SE entregó en este sprint

### Backend (Next 15 + Prisma)
- **Schema**: `DiaryEntry`, `CredentialStamp`, `AlbergueFavorite`, `GpsPoint`, `AnalyticsEvent` con índices, FKs y migración SQL (`20260508210000_diary_credential_favorites_gps_analytics`).
- **Endpoints nuevos**:
  - `GET/POST /api/diary`, `GET/PATCH/DELETE /api/diary/[id]`, `POST/DELETE /api/diary/[id]/share`, `GET /api/diary/public/[token]`.
  - `GET /api/credential`, `POST /api/credential/stamps` (con validación GPS de 200 m).
  - `POST/DELETE /api/albergues/[id]/favorite`, `GET /api/albergues/favorites`.
  - `POST /api/gps/track` (batched).
  - `POST /api/analytics/event` (batched).
  - `GET /api/companions/nearby` (radio 25 km, requiere `shareLocation`).
  - `GET /api/practical/emergencies`.
- Subida de imágenes ahora acepta `diary` además de `avatars`/`posts`.

### App (Expo Router 6 + RN 0.81)
- **Onboarding**: 3 pantallas (Hero → Routes → Cta). Botón "Saltar" arriba a la derecha. CTA final con tres opciones: registrarse, **explorar sin cuenta** (modo invitado persistido), o iniciar sesión. Progreso persistido en `AsyncStorage` para continuar tras salir/volver. Telemetría por paso.
- **Auth store**: `isGuest` + `enterGuestMode/exitGuestMode` con persistencia en `AsyncStorage`. `app/index.tsx` redirige al usuario invitado a `(tabs)/explore`.
- **Home (`explore.tsx`)**: banner de invitado, alerta de "te has desviado" cuando `tracking.offRoute=true`, **5 accesos rápidos** (Trackear, Diario, Credencial, Práctica, Comunidad), **frase del día** (`@lib/dailyQuote`), **widget de tiempo** con Open-Meteo (`@hooks/useWeather`), telemetría `home_view`.
- **Stage detail (`stage/[id].tsx`)**:
  - **Perfil de elevación** SVG (`@components/ElevationProfile`).
  - **Controles de tracking GPS** integrados con el hook `useTracking` (start/stop, distancia en vivo).
  - Atajos a "anotar en diario" y "sellar credencial" ligados a la etapa.
- **Albergues**: corazón de favoritos en el header (toggle persiste en API). Botón "Avísame antes del cierre (21:30)" que programa una notificación local.
- **Diario del peregrino**:
  - Pantalla lista (`/diary`) con FAB.
  - Editor (`/diary/new`) con título, cuerpo (8000 chars), 5 estados de ánimo, hasta 10 fotos (Cloudinary).
  - Detalle (`/diary/[id]`) con compartir/revocar enlace público (Share API), eliminar.
- **Credencial digital**:
  - Vista (`/credential`) con tarjeta de Compostela + lista de sellos.
  - Añadir sello (`/credential/add`) por GPS o manual; backend valida proximidad ≤ 200 m.
  - Elegibilidad de Compostela: ≥ 5 sellos y ≥ 2 días distintos en últimos 100 km.
- **Información práctica (`/practical`)**:
  - Frases en 6 idiomas (es/en/fr/de/pt/it) en 5 categorías.
  - Contactos de emergencia globales + 6 regiones.
  - Lista de equipaje interactiva con persistencia local.
  - Calculadora de preparación basada en condición física + experiencia.
- **Tracking GPS** (`@lib/tracking.ts`):
  - `expo-location` foreground con `BestForNavigation`.
  - Buffer SQLite (`expo-sqlite`) que sobrevive reinicios.
  - Sync por batches a `/api/gps/track`.
  - Detección de "off-route" (>200 m del polyline) en tiempo real.
  - Anti-jumps (>1 km en <30 s descartados), anti-duplicados (<5 m).
- **GPX export** (`@lib/gpx.ts`): genera GPX 1.1 desde la lista de puntos.
- **Notificaciones inteligentes** (`@lib/notifications.ts` + `settings/notifications.tsx`):
  - Recordatorio diario de salida (06:30 por defecto, configurable).
  - Resumen semanal (domingos 19:00).
  - Alerta de cierre de albergue (21:30).
  - Plantilla "etapa de mañana" para 21:00.
  - Cancelar todas.
- **Analytics** (`@lib/analytics.ts`): cola en memoria + AsyncStorage, flush cada 30 s o en lotes de 20, eventos nombrados (`onboardingStep`, `paywallShown`, `stageCompleted` con `validated: gps|manual`, `albergueFavorite`, `credentialStamp`, etc).
- **i18n**: claves nuevas en es/en para diary, credential, practical, gamification, home, notifications, guest. Frases en 6 idiomas para `/practical`.
- **TypeScript**: `tsc --noEmit` verde tanto en `santiagoways-api` como en `santiagoways-app`.

---

## Pendiente prioridad ALTA (siguiente sprint)

1. **Background GPS tracking** real
   - Falta registrar la `TaskManager.defineTask(BACKGROUND_LOCATION_TASK)` y enganchar `Location.startLocationUpdatesAsync` con `pausesUpdatesAutomatically`.
   - Verificar que `UIBackgroundModes` ya incluye `location` en iOS y `ACCESS_BACKGROUND_LOCATION` en Android (`app.json` lo declara para iOS — falta verificar AndroidManifest tras prebuild).
   - Plan de batería: alternar `Accuracy.High` ↔ `Accuracy.Balanced` según velocidad detectada.

2. **Sellos por QR**
   - `/credential/add` solo expone GPS y manual. Falta integrar `expo-camera` BarCodeScanner y un parser para QRs oficiales (formato `sw://stamp?slug=...&name=...&lat=...&lng=...`).

3. **Comunidad mejorada (parcial)**
   - Hook `useNearbyCompanions` ya consume `/api/companions/nearby`, pero no hay pantalla todavía. Faltan:
     - `/community/nearby` con mapa de peregrinos cercanos (privacy-aware).
     - Filtro de feed por etapa actual (`stageId`) — endpoint existe (`Post.stageId`), solo falta UI.
     - Grupos por año de peregrinación (modelo nuevo + UI).
     - Foro Q&A por etapa (modelo nuevo).

4. **Diario → PDF de Compostela**
   - Stub de "compartir Compostela" usa `Share.share` con texto. Falta:
     - Render del diario como HTML → PDF en server (puppeteer / serverless) o `react-native-print` en cliente.
     - Diseño de Compostela visual (con sellos, ruta, mapa miniatura).

5. **Validación de etapa con GPS**
   - Hoy el botón "Parar" registra el track y emite `stageCompleted`, pero no hay endpoint que marque la `PilgrimageStage` como completada cuando el último punto está dentro de N metros del `endPoint`. Añadir `POST /api/pilgrimages/stages/[id]/complete` con verificación.

6. **Mapas offline reales**
   - `/lib/offline.ts` ya descarga `.mbtiles`, pero el visor de stage map sigue usando tiles online. Integrar `@maplibre/maplibre-react-native` + `mbtiles://` (o `react-native-mbtiles-server`) para servir tiles desde el archivo descargado.
   - Auto-descarga la noche anterior si hay etapa programada y wifi.

7. **Performance / batería**
   - Auditar bundle con `npx expo export` + analizador.
   - Lazy-load `react-native-maps` (solo en pantallas de mapa).
   - Memoizar marcadores en `(tabs)/map.tsx` (~30+ markers en re-render).
   - Profile de batería con tracking real durante una etapa de 6 h.

---

## Pendiente prioridad MEDIA

8. **Personalización del home**
   - Quick actions hoy son fijas. Falta: registrar uso → ordenar las 3-5 más usadas según comportamiento (`AnalyticsEvent` ya está; falta agregación + endpoint `GET /api/users/me/quick-actions`).

9. **Weather / off-route en notificaciones**
   - `fetchTomorrowRain` existe en `@lib/weather` pero ningún caller lo invoca. Añadir job (server cron o expo-task-manager `BackgroundFetch`) que mire el pronóstico de la siguiente etapa y dispare `expo-notifications` si llueve >5 mm.

10. **Servicios a lo largo de la ruta en stage detail**
    - Ya se renderizan `waypoints`. Falta agruparlos por tipo (agua / bar / albergue) en una "timeline" lateral y mostrar el km aproximado donde aparecen.

11. **Logros / streak**
    - El hook `useStats` ya calcula streak + km totales + fotos a partir de stages completadas + diario. Falta:
      - Pantalla `/profile/stats` que renderice las cards.
      - Otorgar logros automáticamente: ya existe `Achievement` en schema; añadir `lib/achievements.ts` que inserta `UserAchievement` cuando se cumplen condiciones tras `stageCompleted` / `diaryEntryCreated`.

12. **Comparativa con la media de peregrinos**
    - Falta endpoint `GET /api/stats/peers?stageId=...` que devuelva km/día medios para comparar.

13. **Free trial 7 días**
    - El plan card no expone trial. Hoy se asume RevenueCat lo gestiona pero no se comunica al usuario. Añadir CTA "Empieza prueba gratis" en `/plans` y gating "trial" en `subscription` (ya existe el estado `trial` en `lib/permissions.ts`).

14. **Soft paywall + analytics**
    - `Analytics.paywallShown(feature)` y `paywallUpgrade` definidos pero no se invocan desde `FeatureGate`. Wire-up rápido en `useUpgradePrompt`.

15. **Comunidad por año/grupo**
    - Schema necesita `PilgrimageGroup` y `PilgrimageGroupMember` (año, ruta, owner).

---

## Pendiente prioridad BAJA / nice-to-have

16. **Onboarding pre-firma**
    - Idea: pedir fecha estimada de inicio del Camino y ruta antes incluso de registrarse, para precargar el home tras crear cuenta.

17. **Dynamic island / live activities (iOS)**
    - Mostrar tracking en vivo en la Dynamic Island con km recorridos. Requiere `expo-live-activities` + Swift extension.

18. **Web equivalente**
    - El proyecto API expone Next.js con `app/page.tsx`. Hoy es una landing trivial. Aprovechar para SEO con la lista de rutas y posts públicos.

19. **Densidad de mapas**
    - Usar `react-native-maps` clustering nativo cuando hay >50 markers (los hay en mapa global de albergues).

20. **Tests**
    - Sin tests unitarios para libs nuevas (`tracking`, `geo`, `notifications`, `analytics`). Añadir Jest + RTL para los hooks/queries críticos.

---

## Verificaciones realizadas en este sprint

- ✅ `tsc --noEmit` verde en `santiagoways-api` y `santiagoways-app`.
- ✅ Migración Prisma generada y `prisma generate` regenerado el cliente.
- ✅ i18n: nuevas claves en es y en (las pantallas siguen `t(...)` en todo lo nuevo).
- ⚠️ **No verificado en runtime** (limitación del entorno): tracking GPS real en background iOS/Android, notificaciones llegando al dispositivo, offline mode con avión activado, Lighthouse en la web. Recomendación: probar en dispositivo físico iOS y Android antes del release.

## Notas para el desarrollador

- `EXPO_PUBLIC_API_BASE_URL` se usa también para construir el dominio público del diario (`PUBLIC_BASE` en `app/diary/[id].tsx`). Ajustar antes de release.
- `/api/practical/emergencies` devuelve datos hard-coded; conviene moverlos a la base de datos cuando crezca a más regiones (modelo `EmergencyContact` con `region`, `kind`, `phone`).
- El `router.d.ts` de expo-router se regenera automáticamente al lanzar `expo start`. Las rutas nuevas (`/diary`, `/credential`, `/practical`, ...) están añadidas manualmente — si el typecheck falla tras un nuevo `expo start`, simplemente vuelve a correr y se sincroniza.

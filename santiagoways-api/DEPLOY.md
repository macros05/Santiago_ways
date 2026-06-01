# Desplegar SantiagoWays API en tu servidor Linux (persistente)

Stack: **Next.js 15 + Prisma/Postgres**, servido con **Docker Compose** (Postgres + API + Caddy con HTTPS automático). Todo arranca solo al reiniciar el servidor y los datos de Postgres viven en un volumen, así que es **persistente**.

## 0. Requisitos en el servidor

- Linux con **Docker** + plugin **Docker Compose** (`docker compose version`).
- Un **dominio** (p.ej. `api.santiagoways.app`) con un **registro DNS A** apuntando a la IP del servidor.
- Puertos **80** y **443** abiertos (Caddy saca el certificado TLS solo).
- Que Docker arranque al boot: `sudo systemctl enable --now docker`.

## 1. Subir el código

```bash
# opción A: git
git clone <tu-repo> santiagoways && cd santiagoways/santiagoways-api
# opción B: copiar solo la carpeta del API
rsync -av santiagoways-api/ usuario@servidor:/opt/santiagoways-api/
```

Todo lo necesario está dentro de `santiagoways-api/` (imagen autocontenida; no necesita el resto del monorepo).

## 2. Configurar el entorno

```bash
cp .env.production.example .env
# genera secretos:
openssl rand -base64 32   # úsalo para JWT_SECRET
openssl rand -base64 32   # JWT_REFRESH_SECRET
openssl rand -base64 32   # CRON_SECRET
nano .env                 # rellena POSTGRES_PASSWORD, API_DOMAIN, GOOGLE_CLIENT_ID, REVENUECAT_WEBHOOK_SECRET, etc.
```

Obligatorios en prod: `POSTGRES_PASSWORD`, `API_DOMAIN`, `APP_PUBLIC_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `REVENUECAT_WEBHOOK_SECRET`. `DATABASE_URL` se construye solo en `docker-compose.yml` desde `POSTGRES_*` — **no lo pongas**.

## 3. Arrancar

```bash
docker compose up -d --build
```

Esto: construye la imagen del API, levanta Postgres (con volumen `pgdata`), **aplica las migraciones automáticamente** (el entrypoint corre `prisma migrate deploy`), arranca el API y Caddy obtiene el certificado HTTPS para tu dominio.

Sembrar datos iniciales (rutas/etapas del Camino) — **solo la primera vez**:

```bash
docker compose exec api npm run prisma:seed
```

## 4. Verificar

```bash
curl https://TU_DOMINIO/api/health      # -> {"status":"ok",...}
docker compose ps                       # los 3 servicios "Up" (db healthy)
docker compose logs -f api              # logs en vivo
```

Si `/api/health` devuelve `503 env_missing`, mira el campo `missing` para saber qué variable falta en `.env` (luego `docker compose up -d` para recargar).

## 5. Cron diario (retención de GPS, reemplaza el cron de Vercel)

El endpoint `/api/cron/gps-retention` borra puntos GPS de más de 90 días. En Vercel lo lanzaba `vercel.json`; aquí usa el **crontab del host**:

```bash
crontab -e
# añade (sustituye CRON_SECRET y el dominio):
0 4 * * * curl -fsS -X POST -H "Authorization: Bearer TU_CRON_SECRET" https://TU_DOMINIO/api/cron/gps-retention >/dev/null 2>&1
```

## 6. Actualizar / operar

```bash
git pull && docker compose up -d --build     # desplegar cambios (re-migra solo)
docker compose restart api                    # reiniciar solo el API
docker compose down                           # parar (los datos persisten en el volumen)
docker compose exec db pg_dump -U santiagoways santiagoways > backup_$(date +%F).sql   # backup
```

**Persistencia:** `restart: unless-stopped` en los 3 servicios + volumen `pgdata` → sobreviven a reinicios del contenedor y del servidor. Para borrar TODO (incl. datos): `docker compose down -v`.

## 7. Apuntar la app móvil al servidor

En `santiagoways-app/.env`:

```
EXPO_PUBLIC_API_BASE_URL=https://TU_DOMINIO/api
```

Y reconstruye la app (ver `scripts/reinstall-iphone.sh`). Así la app instalada habla con tu servidor en vez del túnel ngrok de desarrollo.

## Notas

- La imagen instala las deps del API por su cuenta (no usa el lockfile del monorepo). Para builds 100% reproducibles, genera un `package-lock.json` en `santiagoways-api/` y cambia `npm install` por `npm ci` en el `Dockerfile`.
- Caddy guarda los certificados en el volumen `caddy_data` (no se re-emiten en cada reinicio).
- ¿Sin dominio todavía? Quita el servicio `caddy` y publica el API directo con `ports: ["3000:3000"]` en `api` (sin HTTPS — solo para pruebas).

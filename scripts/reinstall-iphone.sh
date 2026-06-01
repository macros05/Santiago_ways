#!/usr/bin/env bash
# Reinstala SantiagoWays en el iPhone conectado tras el rediseño "Flecha".
#
# Por defecto: instala deps y compila Release (embebe TODO el rediseño JS —
# colores, home, fotos de onboarding y el fix del bloqueo) e instala en el móvil.
#
# Con --icons: además regenera el proyecto nativo iOS (expo prebuild) para que
# apliquen el NUEVO icono y splash de app.json. OJO: modifica santiagoways-app/ios/
# (revísalo con `git diff` y revierte si no te convence).
#
# Requisitos: iPhone por cable, DESBLOQUEADO, Developer Mode ON, Xcode instalado.
# Uso:
#   bash scripts/reinstall-iphone.sh            # rebuild + install
#   bash scripts/reinstall-iphone.sh --icons    # además icono/splash nuevos
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/santiagoways-app"

DO_ICONS=0
[ "${1:-}" = "--icons" ] && DO_ICONS=1

echo "▸ Instalando dependencias (workspaces)…"
( cd "$ROOT" && npm install --no-audit --no-fund )

API_URL=$(grep -E '^EXPO_PUBLIC_API_BASE_URL=' "$APP/.env" 2>/dev/null | cut -d= -f2- || true)
echo "▸ La app apuntará a: ${API_URL:-(EXPO_PUBLIC_API_BASE_URL no definido en santiagoways-app/.env)}"
echo "  Para tu servidor Linux, ponlo a:  https://TU_DOMINIO/api"

if [ "$DO_ICONS" = "1" ]; then
  echo "▸ Regenerando el proyecto iOS para aplicar icono/splash nuevos (expo prebuild)…"
  echo "  Nota: esto modifica santiagoways-app/ios/ — revísalo después con 'git diff'."
  ( cd "$APP" && npx expo prebuild -p ios )
fi

echo "▸ Compilando (Release) e instalando en el iPhone…"
bash "$ROOT/scripts/run-on-iphone.sh"

#!/usr/bin/env bash
# SantiagoWays — instalar la app (prebuild firmada) en el iPhone conectado.
# Uso: conecta el iPhone DESBLOQUEADO por cable y ejecuta:  bash scripts/install-iphone.sh
set -euo pipefail

echo "▸ Buscando iPhone conectado…"
DEV_LINE=$(xcrun xctrace list devices 2>/dev/null | grep -iE "iphone" | grep -viE "simulator" | head -1 || true)
if [ -z "${DEV_LINE}" ]; then
  echo "✗ No veo ningún iPhone. Conéctalo por cable, desbloquéalo y dale 'Confiar'."
  exit 1
fi
# UDID = lo que está entre el último par de paréntesis
UDID=$(echo "$DEV_LINE" | sed -E 's/.*\(([0-9A-Fa-f-]+)\)$/\1/')
echo "  iPhone: $DEV_LINE"
echo "  UDID:   $UDID"

# Preferir la build Release (standalone); si no, Debug (necesita Metro).
APP=$(find "$HOME/Library/Developer/Xcode/DerivedData" -path "*Build/Products/Release-iphoneos/SantiagoWays.app" 2>/dev/null | grep -v Index.noindex | head -1 || true)
[ -z "$APP" ] && APP=$(find "$HOME/Library/Developer/Xcode/DerivedData" -path "*Build/Products/Debug-iphoneos/SantiagoWays.app" 2>/dev/null | grep -v Index.noindex | head -1 || true)
if [ -z "$APP" ]; then
  echo "✗ No encuentro una .app compilada. Vuelve a compilar antes (ver scripts/build-iphone.sh)."
  exit 1
fi
echo "▸ App: $APP"

echo "▸ Instalando en el iPhone…"
xcrun devicectl device install app --device "$UDID" "$APP"

echo ""
echo "✅ Instalada. ÚLTIMO PASO en el iPhone:"
echo "   Ajustes → General → VPN y gestión de dispositivos → tu perfil (Apple ID) → Confiar."
echo "   Luego abre 'SantiagoWays' desde la pantalla de inicio."

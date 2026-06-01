#!/usr/bin/env bash
# SantiagoWays — compila (apuntando a TU iPhone) e instala.
# Requisitos: iPhone conectado por cable, DESBLOQUEADO, Developer Mode ON.
# Uso:  bash scripts/run-on-iphone.sh
set -uo pipefail
cd "$(dirname "$0")/../santiagoways-app"

TEAM=X9B22M598Q
WS=ios/santiagoways.xcworkspace
COMMON=(-workspace "$WS" -scheme SantiagoWays -allowProvisioningUpdates \
        -allowProvisioningDeviceRegistration DEVELOPMENT_TEAM=$TEAM CODE_SIGN_STYLE=Automatic)

echo "▸ Buscando iPhone…"
UDID=$(xcrun xctrace list devices 2>/dev/null | grep -iE "iphone" | grep -viE "simulator" | head -1 | sed -E 's/.*\(([0-9A-Fa-f-]+)\)$/\1/')
[ -z "$UDID" ] && { echo "✗ Conecta el iPhone (desbloqueado, Developer Mode ON) y reintenta."; exit 1; }
echo "  UDID=$UDID"

echo "▸ Resolviendo paquetes (MapLibre)…"
xcodebuild "${COMMON[@]}" -resolvePackageDependencies >/dev/null 2>&1

build_and_get_app () { # $1 = Release|Debug
  local cfg="$1" sdkdir
  # NOTE: this function's stdout is captured into $APP, so all human-facing
  # logging here MUST go to stderr (>&2) — otherwise it pollutes the .app path.
  echo "▸ Compilando $cfg (apuntando a tu iPhone)…" >&2
  xcodebuild "${COMMON[@]}" -configuration "$cfg" -sdk iphoneos \
    -destination "platform=iOS,id=$UDID" build > "/tmp/sw_run_${cfg}.log" 2>&1
  grep -q "BUILD SUCCEEDED" "/tmp/sw_run_${cfg}.log" || return 1
  sdkdir="${cfg}-iphoneos"
  find "$HOME/Library/Developer/Xcode/DerivedData" -path "*Build/Products/${sdkdir}/SantiagoWays.app" 2>/dev/null | grep -v Index.noindex | head -1
}

APP=$(build_and_get_app Release)
MODE="Release (standalone, funciona sin el Mac)"
if [ -z "$APP" ]; then
  echo "  Release falló; probando Debug (necesita el servidor Metro en marcha)…"
  APP=$(build_and_get_app Debug)
  MODE="Debug (requiere 'npx expo start' en el Mac y misma red/túnel)"
fi
[ -z "$APP" ] && { echo "✗ Build falló. Revisa /tmp/sw_run_Release.log y /tmp/sw_run_Debug.log"; exit 1; }
echo "▸ App ($MODE): $APP"

echo "▸ Instalando en el iPhone…"
xcrun devicectl device install app --device "$UDID" "$APP" || {
  echo "✗ Falló la instalación. ¿iPhone desbloqueado y 'Confiar' aceptado?"; exit 1; }

echo ""
echo "✅ INSTALADA — modo: $MODE"
echo "   En el iPhone: Ajustes → General → VPN y gestión de dispositivos → Confiar en tu perfil."
echo "   Luego abre 'SantiagoWays'."

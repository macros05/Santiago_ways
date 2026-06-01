# SantiagoWays — Rediseño visual "Flecha" + fix de "Iniciar Camino"

**Fecha:** 2026-06-01
**Estado:** Aprobado en dirección, pendiente de plan de implementación
**Autor:** Marcos + Claude

## 1. Contexto y problema

Auditoría de la app (Expo / React Native, expo-router, tema oscuro único "Liquid Dawn") detectó 4 problemas reportados por el usuario:

1. **Pantalla cargada:** la home `app/(tabs)/explore.tsx` apila 8+ secciones y ~15 elementos tocables en el primer pliegue, sin una acción dominante.
2. **Choque de color:** el sistema usa **tres amarillos** casi idénticos juntos — `amber400 #FBBF24`, `gold #FFD700`, `horizon #F0A92B` — lo que se ve "barro" dorado en vez de jerarquía.
3. **Bloqueo al iniciar un Camino:** al pulsar "Empezar mi Camino" la app se queda con el spinner para siempre.
4. **Imágenes "demasiado IA":** icono (concha gel 3D + halo arcoíris), splash (aurora boreal sobre montañas de metal líquido) y 3 héroes de onboarding generados por IA con estética fantasía irreal (auroras boreales que no existen en el Camino).

## 2. Decisiones tomadas (con el usuario)

- **Color:** mantener **un único amarillo** (la flecha amarilla del Camino) + **verde bosque gallego** como tier estructural + piedra cálida. (Elegido "Verde bosque" sobre azul noche / terracota.)
- **Imágenes:** **regenerar con Gemini** en un estilo nuevo y auténtico (documental, sin auroras ni metal líquido), reescribiendo los prompts de `scripts/gen-assets.mjs`.
- **Arranque:** escribir spec + plan y luego implementar todo de forma ordenada.

## 3. Dirección elegida: "Flecha — un amarillo sobre piedra"

Ganadora unánime (9/9/9) de un panel de 3 direcciones evaluadas en autenticidad / claridad / premium.

**Principio rector de color:**
- **Amarillo flecha `#F5C518`** = el ÚNICO color cromático "de acción". Reservado a: el CTA primario único, el arco de progreso activo, el waypoint actual y la marca de la flecha. Regla dura: **nunca dos elementos rellenos en amarillo en la misma pantalla**.
- **Jerarquía premium sin segundo amarillo:** amarillo relleno = acción; amarillo en contorno (1px) = premium/"más". Mismo tono, distinto peso.
- **Verde bosque** = todo el énfasis estructural cotidiano (iconos, chips, botones secundarios, rellenos de progreso no-primario, "en ruta", badges, líneas de ruta en mapa). Verde y amarillo están opuestos en la rueda y el verde es oscuro, así que nunca compite con el CTA.
- **Latón antiguo `#C9A84A`** = premium/Compostela expresado como **material** (filete de 1px + sello), nunca como relleno ni botón. Sustituye al oro.
- **Piedra cálida** = neutros (fondo, superficies, texto).

## 4. Workstreams

### Workstream A — Sistema de color (tokens)

Como ~166 usos pasan por tokens con nombre y solo hay 1 hex hardcodeado suelto, la base es **cambiar los VALORES de los tokens en sitio** en `src/design/tokens.ts` (sin renombrar call-sites), y luego una pasada de **reasignación de call-sites** de amarillo→verde donde el amarillo era decorativo/estructural.

**A.1 — Repintar valores en `src/design/tokens.ts`:**

Amarillo unificado (la familia `amber*` se repunta a un solo tono flecha):
- `amber400: '#FBBF24'` → `'#F5C518'`  (acento único; es `theme.accent`)
- `amber300: '#FCD34D'` → `'#F8D24A'`
- `amber500: '#F59E0B'` → `'#D9A912'`
- `amber600: '#D97706'` → `'#B8860B'`
- `warning: '#FBBF24'` → `'#F5C518'`  (off-route = "sigue la flecha")
- `amberTintSoft/Muted/Strong` → recomputar sobre `rgba(245,197,24, …)` (0.12 / 0.18 / 0.30)
- `glassFillAmber: 'rgba(251,191,36,0.10)'` → `'rgba(245,197,24,0.10)'`

Oro → latón (premium como material):
- `gold: '#FFD700'` → `'#C9A84A'`
- `goldTintSoft/Muted/Strong` → `rgba(201,168,74, …)` (0.10 / 0.15 / 0.30)

Tercer amarillo fuera:
- `horizon: '#F0A92B'` → alias a `'#F5C518'` (desaparece como tono distinto)

Tier verde (nuevos tokens):
- `bosque: '#3A5A40'`  (estructura primaria)
- `musgo:  '#4F7A52'`  (lift en bordes/rellenos)
- `sendero:'#2E5A3D'`  (sombra verde)
- `greenTintSoft/Muted/Strong`: `rgba(58,90,64, 0.12 / 0.18 / 0.30)`

Neutros más cálidos (tuning):
- `ink: '#08070B'` → `'#0B0A09'`  (lee como sombra de piedra, no espacio)
- `cream: '#FFFBEB'` → `'#F7F3EA'`  (blanco suavizado, menos duro)
- (Opcional, bajo riesgo) `stone900 #1C1917` → `#16130F` para superficie más cálida.

Estados:
- `success: '#34D399'` → `'#4F7A52'`  (musgo; encaja con el tier verde)
- `error: '#FB7185'` → `'#C2553D'`  (terracota / teja romana)
- `info: '#60A5FA'` → tono piedra neutro (p.ej. `'#A8A29E'`) para matar el segundo acento "tech"

Gradientes (`gradients`):
- `sunrise` (4 amarillos apilados) → tonal de un solo amarillo `['#F8D24A', '#F5C518', '#D9A912']` (o sólido).
- `aurora` `['#5B8DEF','#A78BFA','#FBBF24']` → verde tonal `['#4F7A52','#3A5A40']` (el progreso primario del hero usa el amarillo flecha directamente).
- `gold` `['#FDE68A','#FFD700','#D97706']` → latón tonal `['#D8C078','#C9A84A','#A8863A']`.
- `dawn` (fondo ambiental indigo/twilight) → **piedra-noche cálido** `['#0B0A09','#14110D','#1A140F','#13100C','#0B0A09']` para des-auroricar el fondo de la home (`AuroraBackground` consume `gradients.dawn`).

Glows (`glow`):
- `amber` shadowColor `#FBBF24` → `#F5C518`.
- `gold` shadowColor `#FFD700` → `#C9A84A` (opacidad/radio más bajos; menos halo).
- `aurora` shadowColor `#7C7BFF` → verde `#4F7A52` y radio reducido (quitar el "bloom" tipo render).

**A.2 — `src/design/theme.ts`:** casi sin cambios (referencia tokens). `accent` ya apunta a `amber400` (ahora flecha). Verificar `accentMuted` (`amber500`, ahora `#D9A912` — mismo tono, OK). Confirmar `background/text` heredan ink/cream nuevos.

**A.3 — Reasignación de call-sites (amarillo → verde estructural):** la disciplina real. El amarillo se queda SOLO en el CTA primario único + arco de progreso activo + flecha. Todo lo demás que hoy usa `amber400` decorativo pasa a `bosque/musgo` (o piedra). Prioridad por visibilidad:
1. Componentes compartidos: `Button` (primary = flecha; secondary/ghost = verde/piedra), `Badge` (`gold`/`premium` → contorno latón o contorno amarillo), `Card`, `TabBar`, `ProgressRing`.
2. Home `explore.tsx`: chips de quick-actions, bell, icon tints → verde.
3. Onboarding y selector de ruta (`profile-setup.tsx`): bordes de selección → amarillo SOLO si es la selección activa; resto verde.
4. Barrido iterativo del resto de pantallas (settings, diary, credential, etc.).

### Workstream B — Imágenes (regeneración con Gemini)

Mecanismo: `scripts/gen-assets.mjs` ya llama a la API de Gemini (`gemini-3-pro-image-preview` / `gemini-2.5-flash-image`). Requiere `GEMINI_API_KEY` (hoy **vacía** en `santiagoways-api/.env`; el usuario debe aportarla para ejecutar: `GEMINI_API_KEY=... node scripts/gen-assets.mjs`).

**B.1 — Reescribir el prompt `STYLE`** (eliminar la fantasía):
> Documental, fotografía natural y auténtica del Camino de Santiago real en España. Cámara 35mm, luz natural de hora dorada o cielo cubierto, color realista, grano de película suave, profundidad de campo natural. Paleta terrosa cálida — piedra desgastada, verdes de eucalipto y roble, cielo crema, la icónica flecha amarilla del Camino. Calmado, esperanzador, sin pretensiones. **SIN aurora boreal, SIN luces del norte, SIN metal líquido, SIN render 3D brillante, SIN neón, SIN cielo surreal, SIN holográfico, SIN sci-fi.** Sin texto, sin letras, sin marca de agua.

**B.2 — Prompts por asset** (documental, auténtico):
- `splash.png` (9:16): flecha amarilla pintada sobre piedra gris gallega desgastada al amanecer, minimal, mucho espacio negativo, viñeta cálida abajo.
- `onboarding-hero.png` (9:16): flecha amarilla en un mojón apuntando a un sendero de tierra entre eucaliptos en Galicia, hora dorada, niebla suave, esperanzador.
- `onboarding-routes.png` (9:16): colinas verdes y un sendero del Camino serpenteando por el campo del norte de España a hora dorada, aldea medieval al fondo (sin estelas de luz).
- `onboarding-community.png` (9:16): peregrinos con mochila descansando y charlando en el patio de un albergue de piedra al atardecer, luz cálida de farol, momento humano genuino, caras naturales (no difuminadas).
- `notification-icon.png`: glifo blanco plano (flecha o vieira) sobre negro, alto contraste.

**B.3 — Icono y adaptive-icon (caso especial):** un icono plano sale mejor como **vector hecho a mano** que vía Gemini. Plan: intentar Gemini con prompt de "flecha amarilla `#F5C518` ligeramente inclinada sobre azulejo verde bosque `#3A5A40` con textura de piedra, plano, sin gloss/bevel/gradiente, como un waymark pintado real"; **si no sale nítido, fallback a SVG→PNG hecho a mano** (Claude genera el SVG). Actualizar `app.json` (icon/splash/adaptive-icon) si cambian rutas.

**B.4 — Limpieza de assets:**
- `aurora-bg.png`: se elimina. La pantalla Routes de onboarding (`src/features/onboarding/Routes.tsx`, hoy usa `aurora-bg.png`) pasa a usar `onboarding-routes.png` real (revive el asset hoy muerto en `src/media.ts:8`). El fondo de la home sigue por código (`AuroraBackground` con `gradients.dawn` retuneado a piedra cálida).
- Actualizar `src/media.ts` y `src/features/onboarding/{Hero,Routes,Cta}.tsx`.

**B.5 — Hero de la home (foto):** `explore.tsx:146` usa una URL de Unsplash hardcodeada (cromo, rompe offline). Sustituir por un **asset local empaquetado** (foto real de terreno del Camino, generada en el mismo lote) con fallback a card cálida sin imagen.

### Workstream C — Declutter de la home (`explore.tsx`)

Una sola acción dominante y jerarquía clara. Zonas, de arriba abajo:
1. **Header compacto:** wordmark Fraunces pequeño a la izq; un glifo piedra (no amarillo) de perfil/premium a la der. Saludo a una línea piedra.
2. **LA acción dominante** (~45% del primer pliegue): hero único full-width.
   - Con Camino activo → card con foto real de etapa, nombre en Fraunces, arco de progreso fino `#F5C518`, y UN botón relleno amarillo "Continuar etapa".
   - Sin Camino → mismo slot con UN botón relleno amarillo "Empezar mi Camino". (Hoy ese CTA está enterrado a media pantalla.)
3. **Línea de stats** bajo el hero: "Día 12 · 187 / 320 km" en piedra, sin card.
4. **Una card "Hoy"** que fusiona clima + cita + tip (hoy son 3 widgets apilados) en una sola pull-quote Fraunces con meta-label verde. Sin amarillo.
5. **Quick actions:** fila de 4 (Diario · Credencial · Práctico · Comunidad) con chips **verdes**. Se **elimina "Track/Seguir ruta"** de aquí (el tracking vive ya en el CTA del hero) — quita el CTA primario duplicado de `explore.tsx:214`.
6. **"Tu Camino":** carrusel horizontal de próximas etapas, degradado bajo el pliegue.
7. **"Rutas del Camino":** lista completa; filas premium/locked usan filete latón + sello small-caps, nunca relleno oro.
8. **Zona patrocinada al final:** albergues destacados, banner de anuncios y la fila de Guía IA (acento verde, no oro), fuera de los dos primeros pliegues. Banner de invitado → línea piedra discreta al pie.

### Workstream D — Fix del bloqueo "Iniciar Camino"

**Causa raíz (verificada):** en `app/(auth)/profile-setup.tsx` la función `finish()` (líneas 55-92) pone `loading=true` y hace `await api('/pilgrimages', {method:'POST', …})` (líneas 80-83). `api()` en `src/lib/api.ts` hace `fetch` **sin timeout**. Si la API local / túnel ngrok va lenta o está caída, la promesa nunca se resuelve, el spinner se queda fijo y `router.replace('/(tabs)/explore')` (línea 86) no se ejecuta. Si rechazara, el `catch` (87) cortaría — así que un cuelgue real = promesa pendiente (stall de red). Bug secundario: no invalida `['pilgrimage','me']`, así que a veces se ve "Aún no has empezado" tras crear el Camino.

**Arreglo:**
1. **`src/lib/api.ts`:** añadir timeout por defecto vía `AbortController` (p.ej. `timeoutMs = 15000`, combinado con `opts.signal`); al abortar, lanzar `ApiError('timeout', 408)`; limpiar el timeout en `finally`. Aplicar también al `fetch` de `refreshAccessToken`.
2. **`src/lib/uploads.ts`:** timeouts en los `fetch` de subida (no deben colgar el alta del Camino).
3. **`src/hooks/usePilgrimage.ts`:** nuevo `useCreatePilgrimage()` con `useMutation`; `onSuccess` → `qc.setQueryData(['pilgrimage','me'], data)` + `qc.invalidateQueries({queryKey:['pilgrimage','me']})`.
4. **`profile-setup.tsx` `finish()`:** reescribir para usar la mutation; avatar/patch como **best-effort con timeout** (fallo no fatal); el POST decisivo va acotado por timeout → en éxito siembra cache y navega; en timeout/error muestra toast con reintento y **para el spinner** (nunca atrapa al usuario).

### Workstream E — (Opcional, fase 2) Aplanar "liquid glass"

El frosted glass intenso es un cliché de diseño IA. Pasada a nivel componente (`Card`, chips, banners, `Glass`) hacia superficies de piedra cálida plana con bordes hairline. Requiere re-tunear contraste. No bloquea A–D.

## 5. Riesgos y mitigaciones

- **Reasignación de call-sites (A.3):** es el grueso del trabajo de color; se hace por prioridad de visibilidad y barrido iterativo, no en un solo commit gigante. Riesgo de que algún amarillo decorativo se escape → revisión visual pantalla a pantalla.
- **Contraste:** verde bosque sobre casi-negro puede verse "barro"; levantar con `musgo #4F7A52` y verificar AA en texto pequeño tras el swap.
- **Gemini:** `GEMINI_API_KEY` está vacía; sin key no se regeneran imágenes. El trabajo de prompts/código queda listo; la ejecución depende de que el usuario aporte la key. Las imágenes generadas pueden requerir varias iteraciones para verse realmente "no IA".
- **Icono plano vía Gemini:** los modelos fallan con iconos planos nítidos → fallback SVG hecho a mano.
- **Anuncios/albergues al final:** baja su visibilidad; confirmar con monetización antes de fijar el orden.
- **Premium sutil (latón):** menos llamativo que el oro; validar que el upsell sigue siendo claro.

## 6. No-objetivos (fuera de alcance)

- Tema claro (la app es dark-only por decisión de producto).
- Cambios en el backend / API (`santiagoways-api`).
- Rediseño de pantallas fuera de home/onboarding más allá del barrido de color.

## 7. Verificación

- `npm run typecheck` (tsc --noEmit) y `npm run lint` sin errores nuevos.
- `npm test` (jest) verde.
- **Bug:** con la API apagada, pulsar "Empezar mi Camino" debe mostrar error/reintento dentro del timeout (≤15s) y liberar el spinner — nunca quedarse colgado. Con API encendida, crea el Camino y navega a una home que ya muestra el Camino (sin "Aún no has empezado").
- **Visual:** revisión en iPhone (scripts `run-on-iphone.sh` / `install-iphone.sh`) de home, onboarding, icono y splash.

## 8. Orden de implementación sugerido

1. **D — Fix del bloqueo** (urgente, independiente). Se puede mergear solo.
2. **A.1/A.2 — Repintar tokens** (kill de los 3 amarillos + latón + verde + neutros cálidos). Quick win visible.
3. **A.3 — Reasignación amarillo→verde** en componentes compartidos + home + onboarding.
4. **C — Declutter de la home.**
5. **B — Imágenes:** reescribir prompts, regenerar (con key), icono, cablear `media.ts` + onboarding + hero local.
6. **E — (opcional) aplanar glass / pulido de componentes.**

# SantiagoWays — Rediseño "Flecha" + fix "Iniciar Camino" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Arreglar el bloqueo al iniciar un Camino y rediseñar la identidad visual a "Flecha" (un único amarillo `#F5C518` + verde bosque + latón), declutter de la home y regenerar las imágenes con un estilo no-IA.

**Architecture:** Cambios de valores en `src/design/tokens.ts` (los call-sites pasan por tokens con nombre) + reasignación amarillo→verde en componentes; fix de red con un util `withTimeout` + `useCreatePilgrimage` (react-query) + navegación segura; restructura de `app/(tabs)/explore.tsx`; reescritura de prompts en `scripts/gen-assets.mjs`.

**Tech Stack:** Expo 54 / React Native 0.81, expo-router, @tanstack/react-query v5, jest + jest-expo (solo unit tests de lógica pura; no hay testing-library de RN instalado), TypeScript, Gemini image API.

**Spec:** `docs/superpowers/specs/2026-06-01-santiagoways-redesign-design.md`

**Convención de tests:** el harness solo soporta unit tests de módulos puros (`__tests__/**/*.test.ts`). Para tokens y utilidades de red hacemos TDD real. Para cambios de UI (RN) y hooks de react-query no hay render testing → se verifican con `npm run typecheck`, `npm run lint` y comprobación manual en iPhone (pasos explícitos). No se escriben tests falsos.

**Todos los comandos se ejecutan desde `santiagoways-app/`** salvo que se indique lo contrario.

---

## Task 0: Rama de trabajo

**Files:** ninguno (git).

- [ ] **Step 1: Crear y cambiar a la rama**

```bash
cd /Users/marcosmor/Desktop/SantiagoWays
git checkout -b redesign/flecha
```

- [ ] **Step 2: Commit de la spec (ya escrita) y el plan**

```bash
git add docs/superpowers/specs/2026-06-01-santiagoways-redesign-design.md docs/superpowers/plans/2026-06-01-santiagoways-redesign.md
git commit -m "docs: spec + plan del rediseño Flecha y fix iniciar-camino"
```

---

# FASE D — Fix del bloqueo "Iniciar Camino" (independiente, mergeable solo)

## Task 1: Util `withTimeout` (TDD)

**Files:**
- Create: `src/lib/withTimeout.ts`
- Test: `__tests__/lib/withTimeout.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
// __tests__/lib/withTimeout.test.ts
import { withTimeout, TimeoutError } from '@lib/withTimeout';

describe('withTimeout', () => {
  afterEach(() => jest.useRealTimers());

  it('resolves with the value when fn settles before the timeout', async () => {
    const result = await withTimeout(async () => 'ok', 1000);
    expect(result).toBe('ok');
  });

  it('throws TimeoutError when fn does not settle in time', async () => {
    jest.useFakeTimers();
    const fn = (signal: AbortSignal) =>
      new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    const p = withTimeout(fn, 1000);
    const expectation = expect(p).rejects.toBeInstanceOf(TimeoutError);
    jest.advanceTimersByTime(1000);
    await expectation;
  });

  it('propagates the original error when an external signal aborts (not a timeout)', async () => {
    const external = new AbortController();
    const fn = (signal: AbortSignal) =>
      new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('external-abort')));
      });
    const p = withTimeout(fn, 10_000, external.signal);
    external.abort();
    await expect(p).rejects.toThrow('external-abort');
    await expect(p).rejects.not.toBeInstanceOf(TimeoutError);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test -- withTimeout`
Expected: FAIL — "Cannot find module '@lib/withTimeout'".

- [ ] **Step 3: Implementar el módulo**

```ts
// src/lib/withTimeout.ts
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Request timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Runs `fn` with an AbortSignal that fires after `ms`. If `external` aborts
 * first, that abort is forwarded and the original rejection is propagated.
 * On the internal timeout, rejects with TimeoutError.
 */
export async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  external?: AbortSignal,
): Promise<T> {
  const ctrl = new AbortController();
  let timedOut = false;

  const onExternalAbort = () => ctrl.abort();
  if (external) {
    if (external.aborted) ctrl.abort();
    else external.addEventListener('abort', onExternalAbort);
  }

  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, ms);

  try {
    return await fn(ctrl.signal);
  } catch (err) {
    if (timedOut) throw new TimeoutError(ms);
    throw err;
  } finally {
    clearTimeout(timer);
    external?.removeEventListener('abort', onExternalAbort);
  }
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm test -- withTimeout`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/withTimeout.ts __tests__/lib/withTimeout.test.ts
git commit -m "feat(lib): add withTimeout util with TimeoutError"
```

---

## Task 2: Timeout por defecto en `api()`

**Files:**
- Modify: `src/lib/api.ts`

> Nota: `@lib/api` está mockeado globalmente en `jest.setup.js`, así que no se testea en jest; se verifica con typecheck + manual.

- [ ] **Step 1: Añadir `timeoutMs` a `RequestOpts` y un default**

En `src/lib/api.ts`, importar el util y añadir la constante (debajo de los imports existentes):

```ts
import { withTimeout, TimeoutError } from './withTimeout';

const DEFAULT_TIMEOUT_MS = 15_000;
```

Añadir el campo a `RequestOpts`:

```ts
type RequestOpts = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Json;
  query?: Record<string, string | number | undefined | null>;
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};
```

- [ ] **Step 2: Envolver `send` con timeout en `api()`**

Reemplazar el bloque desde `const send = async (token...` hasta `let res = await send(...)` por:

```ts
  const send = async (token: string | null, signal: AbortSignal): Promise<Response> => {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (token) headers.authorization = `Bearer ${token}`;
    return fetch(url.toString(), {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal,
    });
  };

  const run = (token: string | null) =>
    withTimeout((signal) => send(token, signal), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS, opts.signal);

  const { access } = await getTokens();
  let res: Response;
  try {
    res = await run(opts.auth === false ? null : access);

    if (res.status === 401 && opts.auth !== false) {
      const fresh = await refreshAccessToken();
      if (fresh) res = await run(fresh);
    }
  } catch (err) {
    if (err instanceof TimeoutError) {
      throw new ApiError('La conexión tardó demasiado. Inténtalo de nuevo.', 408, 'TIMEOUT');
    }
    throw err;
  }
```

- [ ] **Step 3: Añadir timeout al fetch de refresh**

En `refreshAccessToken()`, envolver el `fetch` (mantiene comportamiento, evita cuelgue del refresh):

```ts
    const res = await withTimeout(
      (signal) =>
        fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({ refreshToken: refresh }),
          signal,
        }),
      DEFAULT_TIMEOUT_MS,
    );
```

(Importar ya está hecho en Step 1.)

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api.ts
git commit -m "fix(api): add default request timeout so fetches can't hang forever"
```

---

## Task 3: Timeout en `uploads.ts`

**Files:**
- Modify: `src/lib/uploads.ts`

- [ ] **Step 1: Importar el util**

Añadir bajo el import existente:

```ts
import { withTimeout } from './withTimeout';
```

- [ ] **Step 2: Acotar el HEAD advisory (línea ~36)**

Reemplazar `const head = await fetch(localUri);` por:

```ts
    const head = await withTimeout((signal) => fetch(localUri, { signal }), 8_000);
```

- [ ] **Step 3: Acotar la subida a Cloudinary (línea ~58)**

Reemplazar `const res = await fetch(signed.uploadUrl, { method: 'POST', body: form });` por:

```ts
  const res = await withTimeout(
    (signal) => fetch(signed.uploadUrl, { method: 'POST', body: form, signal }),
    30_000,
  );
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add src/lib/uploads.ts
git commit -m "fix(uploads): bound image upload fetches with timeouts"
```

---

## Task 4: Hook `useCreatePilgrimage`

**Files:**
- Modify: `src/hooks/usePilgrimage.ts`

- [ ] **Step 1: Añadir imports de mutation**

Cambiar la primera línea de imports:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
```

- [ ] **Step 2: Añadir el hook (al final del bloque de hooks, antes de `pilgrimageStats`)**

```ts
export function useCreatePilgrimage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { routeSlug: string; startDate: string }) =>
      api<Pilgrimage>('/pilgrimages', { method: 'POST', body: vars }),
    onSuccess: (data) => {
      // Seed the cache so the home shows the new Camino immediately, then
      // refetch to reconcile with the server (avoids the stale-null empty state).
      qc.setQueryData(['pilgrimage', 'me'], data);
      qc.invalidateQueries({ queryKey: ['pilgrimage', 'me'] });
    },
  });
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/usePilgrimage.ts
git commit -m "feat(pilgrimage): add useCreatePilgrimage mutation with cache invalidation"
```

---

## Task 5: Reescribir `finish()` en `profile-setup.tsx`

**Files:**
- Modify: `app/(auth)/profile-setup.tsx`

- [ ] **Step 1: Importar el hook**

Cambiar el import de hooks:

```ts
import { isLockedRoute, useCreatePilgrimage, useRoutes } from '@hooks/usePilgrimage';
```

- [ ] **Step 2: Instanciar la mutation en el componente**

Tras `const routesQ = useRoutes();` añadir:

```ts
  const createPilgrimage = useCreatePilgrimage();
```

- [ ] **Step 3: Reemplazar `finish()` (líneas 55-92) por:**

```ts
  const finish = async () => {
    if (!routeSlug) {
      toast.error(t('profileSetup.chooseRoute'));
      return;
    }
    setLoading(true);
    try {
      // Avatar + bio are best-effort and must never block (or hang) Camino creation.
      let remoteAvatar: string | null = null;
      if (avatar && avatar.startsWith('file:')) {
        try {
          remoteAvatar = await uploadImage(avatar, 'avatars');
        } catch {
          if (mounted.current) toast.error(t('profileSetup.uploadFailed'));
        }
      } else if (avatar) {
        remoteAvatar = avatar;
      }

      const patch: Record<string, string> = {};
      if (bio) patch.bio = bio;
      if (remoteAvatar) patch.avatar = remoteAvatar;
      if (Object.keys(patch).length > 0) {
        try {
          await api('/users/me', { method: 'PATCH', body: patch });
        } catch {
          /* non-fatal: profile details can be edited later */
        }
      }

      // Decisive path: bounded by api() timeout; seeds the cache on success.
      await createPilgrimage.mutateAsync({
        routeSlug,
        startDate: new Date().toISOString(),
      });

      if (!mounted.current) return;
      if (user) setUser({ ...user, avatar: remoteAvatar ?? user.avatar });
      router.replace('/(tabs)/explore');
    } catch {
      if (mounted.current) toast.error(t('profileSetup.pilgrimageFailed'));
    } finally {
      if (mounted.current) setLoading(false);
    }
  };
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sin errores nuevos. (El import `api` sigue usándose para el PATCH.)

- [ ] **Step 5: Verificación manual del fix**

Run: levantar la app y, **con el backend apagado**, ir a "Empezar mi Camino" → elegir ruta → "Comenzar".
Expected: a los ≤15s aparece el toast de error y el spinner se libera (botón vuelve a estar disponible). NUNCA se queda colgado. Con backend encendido: crea el Camino y la home ya lo muestra (sin "Aún no has empezado").

- [ ] **Step 6: Commit**

```bash
git add app/\(auth\)/profile-setup.tsx
git commit -m "fix(profile-setup): never hang on start-Camino; use mutation + bounded network"
```

---

# FASE A — Sistema de color "Flecha"

## Task 6: Repintar valores de color en `tokens.ts` (TDD de invariantes)

**Files:**
- Modify: `src/design/tokens.ts`
- Test: `__tests__/design/tokens.test.ts`

- [ ] **Step 1: Escribir el test de invariantes (falla)**

```ts
// __tests__/design/tokens.test.ts
import { colors } from '@design/tokens';

describe('Flecha color system', () => {
  it('uses a single flecha yellow as amber400', () => {
    expect(colors.amber400).toBe('#F5C518');
  });

  it('retires the old clashing yellows', () => {
    expect(colors.amber400).not.toBe('#FBBF24');
    expect(colors.horizon).not.toBe('#F0A92B');
  });

  it('replaces gold with antique brass (premium-as-material, not a third yellow)', () => {
    expect(colors.gold).toBe('#C9A84A');
  });

  it('adds the forest-green structural tier', () => {
    expect(colors.bosque).toBe('#3A5A40');
    expect(colors.musgo).toBe('#4F7A52');
    expect(colors.sendero).toBe('#2E5A3D');
  });

  it('warms the neutrals', () => {
    expect(colors.ink).toBe('#0B0A09');
    expect(colors.cream).toBe('#F7F3EA');
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test -- tokens`
Expected: FAIL (valores aún antiguos / tokens verdes inexistentes).

- [ ] **Step 3: Aplicar los cambios de valores en `src/design/tokens.ts`**

Dentro de `export const colors = {`:

```ts
  // Amber family → one single "flecha" wayfinding yellow.
  amber300: '#F8D24A',
  amber400: '#F5C518',
  amber500: '#D9A912',
  amber600: '#B8860B',

  cream: '#F7F3EA',
  cream100: '#FEF3C7',

  // Premium "Compostela" is now a material (antique brass hairline), not a yellow.
  gold: '#C9A84A',

  // Forest-green structural tier (Galicia).
  bosque: '#3A5A40',
  musgo: '#4F7A52',
  sendero: '#2E5A3D',

  success: '#4F7A52',
  error: '#C2553D',
  warning: '#F5C518',
  info: '#A8A29E',
```

Cambiar `ink`:

```ts
  ink: '#0B0A09', // warm stone-shadow base
```

Cambiar `horizon` (que desaparezca como tercer amarillo):

```ts
  horizon: '#F5C518', // retired: aliased to the single flecha yellow
```

Recomputar tints (mismo bloque):

```ts
  // Flecha tints (was amber).
  amberTintSoft: 'rgba(245,197,24,0.12)',
  amberTintMuted: 'rgba(245,197,24,0.18)',
  amberTintStrong: 'rgba(245,197,24,0.30)',

  // Brass tints (premium, was gold).
  goldTintSoft: 'rgba(201,168,74,0.10)',
  goldTintMuted: 'rgba(201,168,74,0.15)',
  goldTintStrong: 'rgba(201,168,74,0.30)',

  // Forest-green tints.
  greenTintSoft: 'rgba(58,90,64,0.12)',
  greenTintMuted: 'rgba(58,90,64,0.18)',
  greenTintStrong: 'rgba(79,122,82,0.30)',
```

Cambiar `glassFillAmber`:

```ts
  glassFillAmber: 'rgba(245,197,24,0.10)',
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm test -- tokens && npm run typecheck`
Expected: PASS + typecheck OK (los nuevos tokens `bosque/musgo/sendero/greenTint*` están en `ColorToken`).

- [ ] **Step 5: Commit**

```bash
git add src/design/tokens.ts __tests__/design/tokens.test.ts
git commit -m "feat(design): collapse to one flecha yellow, add green tier + brass premium"
```

---

## Task 7: Retunear gradientes y glows en `tokens.ts`

**Files:**
- Modify: `src/design/tokens.ts`

- [ ] **Step 1: Reemplazar el bloque `gradients`**

```ts
export const gradients = {
  // Full-screen ambient backdrop: warm stone-night (no indigo aurora).
  dawn: ['#0B0A09', '#14110D', '#1A140F', '#13100C', '#0B0A09'] as const,
  // Hero overlay scrim (transparent → deep ink).
  heroScrim: ['rgba(11,10,9,0)', 'rgba(11,10,9,0.35)', 'rgba(11,10,9,0.96)'] as const,
  // Single-hue flecha sheen for the primary CTA (no four-yellow stack).
  sunrise: ['#F8D24A', '#F5C518', '#D9A912'] as const,
  // Forest-green ribbon for non-primary accents/progress.
  aurora: ['#4F7A52', '#3A5A40'] as const,
  // Antique-brass sheen for premium (was gold).
  gold: ['#D8C078', '#C9A84A', '#A8863A'] as const,
  glassSheen: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)'] as const,
  glassCard: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)'] as const,
} as const;
```

- [ ] **Step 2: Retunear `glow`**

```ts
export const glow = {
  amber:
    Platform.OS === 'android'
      ? { elevation: 10 }
      : { shadowColor: '#F5C518', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 18 },
  gold:
    Platform.OS === 'android'
      ? { elevation: 8 }
      : { shadowColor: '#C9A84A', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 14 },
  aurora:
    Platform.OS === 'android'
      ? { elevation: 8 }
      : { shadowColor: '#4F7A52', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 16 },
} as const;
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/design/tokens.ts
git commit -m "feat(design): retune gradients+glows to warm stone, flecha + green, brass"
```

---

## Task 8: Reasignar amarillo→verde/latón en componentes compartidos

**Files:**
- Modify: `src/components/Button.tsx`
- Modify: `src/components/Badge.tsx`

> Tras Task 6/7, `amber400` ya es la flecha. El botón `primary` (CTA) sigue en flecha — correcto. Aquí quitamos el amarillo de lo NO-primario.

- [ ] **Step 1: Button — quitar amarillo del texto `ghost`**

En `src/components/Button.tsx`, en `textColor`:

```ts
const textColor: Record<Variant, string> = {
  primary: colors.stone950,
  secondary: colors.cream,
  ghost: colors.musgo,
  danger: colors.white,
  glass: colors.cream,
};
```

- [ ] **Step 2: Badge — `gold` variant = latón; mantener premium como material**

En `src/components/Badge.tsx`, en `palette`, cambiar `gold` y `warning`:

```ts
  warning: { bg: 'rgba(245,197,24,0.14)', fg: colors.warning, border: 'rgba(245,197,24,0.30)' },
  info: { bg: 'rgba(168,162,158,0.14)', fg: colors.info, border: 'rgba(168,162,158,0.30)' },
  gold: { bg: colors.goldTintSoft, fg: colors.gold, border: colors.goldTintStrong },
```

(`success`/`error` heredan los nuevos hex vía `colors.success`/`colors.error`; solo actualizar sus `bg/border` rgba si se quiere exactitud — opcional:)

```ts
  success: { bg: 'rgba(79,122,82,0.14)', fg: colors.success, border: 'rgba(79,122,82,0.30)' },
  error: { bg: 'rgba(194,85,61,0.14)', fg: colors.error, border: 'rgba(194,85,61,0.30)' },
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/Button.tsx src/components/Badge.tsx
git commit -m "feat(design): green ghost buttons, brass premium badges"
```

---

## Task 9: Barrido amarillo→verde en pantallas de alta visibilidad

**Files:**
- Modify: `app/(tabs)/explore.tsx`
- Modify: `app/(auth)/profile-setup.tsx`
- Modify: `app/(tabs)/_layout.tsx` (tab bar activo)

> Regla: `amber400` (flecha) solo para el CTA primario único, el arco de progreso activo y la flecha. Iconos/chips/bordes decorativos → `bosque`/`musgo`. Badges de etiqueta no-premium → `success` (verde) o `neutral`.

- [ ] **Step 1: explore.tsx — chips e iconos a verde**

En `app/(tabs)/explore.tsx`:
- `QuickAction` `qaIcon`: `backgroundColor: colors.glassFillAmber` → `colors.greenTintSoft`; icono `color={colors.amber400}` → `colors.musgo`.
- `bell` style: `backgroundColor: colors.glassFillAmber`, `borderColor: colors.amberTintStrong` → `colors.greenTintSoft` / `colors.greenTintStrong`; icono diamante `color={colors.amber400}` → `colors.musgo`.
- `emptyIcon`, `tipIcon`, `lockBadge`, `guestBanner`: `'rgba(251,191,36,0.12)'`/`0.08`/`0.3` → equivalentes verdes `'rgba(58,90,64,0.12)'` / `'rgba(79,122,82,0.30)'`; iconos `colors.amber400` → `colors.musgo` (excepto `lockBadge` lock → `colors.gold` latón).
- Hero badge `variant="gold"` (línea ~158) → `variant="neutral"`.
- "popular" badge `variant="gold"` (línea ~389) → `variant="success"`.
- AI card gradient `['rgba(255,215,0,0.10)','rgba(255,215,0,0.02)']` y `aiIcon`/`aiCard` borde → verdes: `['rgba(79,122,82,0.10)','rgba(79,122,82,0.02)']`, icono `colors.gold` → `colors.musgo`.

(El botón "Continuar etapa"/"Empezar mi Camino" es `Button` primary → se queda flecha. El arco `ProgressRing` se gestiona en Task 11.)

- [ ] **Step 2: profile-setup.tsx — selección activa flecha, resto verde**

- `steps` activo `backgroundColor: n <= step ? colors.amber400 ...` → se queda flecha (es el progreso).
- `cameraBadge` `backgroundColor: colors.amber400` → `colors.musgo`.
- Borde de ruta seleccionada `borderColor: routeSlug === r.slug ? colors.amber400 : colors.stone700` → se queda flecha (selección activa = acción).
- Check de selección `backgroundColor: colors.amber400` → se queda flecha.
- `lock-closed` icon `colors.amber400` (línea ~203) → `colors.gold` (latón premium).
- Badge premium texto `colors.amber400` (línea ~212) → `colors.gold`.

- [ ] **Step 3: tab bar activo**

En `app/(tabs)/_layout.tsx`, color activo de tab `colors.amber400` → mantener flecha SOLO si es el patrón de marca de navegación; si se prefiere coherencia (verde estructural), cambiar a `colors.musgo`. **Decisión:** tab activo → `colors.amber400` (la flecha como wayfinding de navegación es on-brand). Dejar igual; revisar visualmente.

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sin errores.

- [ ] **Step 5: Verificación manual**

Run: app en iPhone → home y onboarding.
Expected: un solo amarillo (el CTA + progreso); iconos/chips en verde; premium en latón. Nada "barro".

- [ ] **Step 6: Commit**

```bash
git add app/\(tabs\)/explore.tsx app/\(auth\)/profile-setup.tsx app/\(tabs\)/_layout.tsx
git commit -m "feat(design): reserve flecha yellow for the single action; green structure"
```

---

# FASE C — Declutter de la home

## Task 10: Componente `HoyCard` (fusiona clima + cita + tip)

**Files:**
- Create: `src/components/HoyCard.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// src/components/HoyCard.tsx
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';

type Props = {
  quote: string;
  weather?: { label: string; tempC: number } | null;
};

/** One calm "Hoy" card: a Fraunces pull-quote + a small green weather meta line.
 *  Replaces the three stacked widgets (quote, weather, daily tip). */
export function HoyCard({ quote, weather }: Props) {
  return (
    <View style={{ paddingHorizontal: spacing['5'], marginTop: spacing['6'] }}>
      <Card padding="4">
        <Text variant="display" color={colors.cream} italic style={{ fontSize: 20, lineHeight: 28 }}>
          {quote}
        </Text>
        {weather ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'], marginTop: spacing['3'] }}>
            <Ionicons name="partly-sunny-outline" size={14} color={colors.musgo} />
            <Text variant="caption" color={colors.musgo}>
              {weather.label} · {weather.tempC.toFixed(0)}°C
            </Text>
          </View>
        ) : null}
      </Card>
    </View>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/HoyCard.tsx
git commit -m "feat(home): add HoyCard merging quote + weather"
```

---

## Task 11: Restructurar `explore.tsx`

**Files:**
- Modify: `app/(tabs)/explore.tsx`

- [ ] **Step 1: Quitar el "Track" duplicado de quick actions**

En `styles.quickActions`/JSX, eliminar el primer `<QuickAction icon="walk-outline" label={t('home.qaTrack')} .../>` (línea ~214). Quedan 4 acciones (Diario, Credencial, Práctico, Comunidad). El tracking vive en el CTA del hero.

- [ ] **Step 2: Sustituir cita + clima por `HoyCard`**

Importar: `import { HoyCard } from '@components/HoyCard';`
Reemplazar los dos bloques "Daily quote" (líneas ~221-231) y "Weather widget" (líneas ~233-253) por:

```tsx
      <HoyCard
        quote={quote}
        weather={weatherQ.data ? {
          label: locale === 'en' ? weatherQ.data.description_en : weatherQ.data.description,
          tempC: weatherQ.data.temperatureC,
        } : null}
      />
```

- [ ] **Step 3: Mover "Consejo del día" (tip) dentro de HoyCard o eliminarlo de la primera mitad**

Eliminar el bloque `<Section title={t('explore.todaysTip')}>` (líneas ~347-364). El `tip` deja de usarse en el primer pliegue (YAGNI: la cita ya cubre el momento "Hoy"). Eliminar también `const tip = ...` (línea ~56) si queda sin uso (verificar con lint).

- [ ] **Step 4: Reordenar — zona patrocinada al final**

Mover el bloque `{showAds ? (<HomeBanner/>) : null}` (líneas ~255-259) para que quede DESPUÉS de "Rutas del Camino" (tras la `</Section>` de rutas, antes de cerrar el ScrollView). Orden final: hero → HoyCard → quick actions (4) → "Tu Camino" (próximas etapas) → Guía IA (si compostelero) → "Rutas del Camino" → HomeBanner + Albergues destacados al final.

- [ ] **Step 5: Reemplazar la URL de Unsplash del hero por asset local**

(Depende de Task 13, que crea `media.homeHero`.) En el hero (`<Image source={{ uri: 'https://images.unsplash.com/...' }}/>`, línea ~146) cambiar a:

```tsx
          <Image source={media.homeHero} style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]} contentFit="cover" />
```

Importar `media` desde `@/media`. Si `media.homeHero` aún no existe, dejar este step para después de Task 13.

- [ ] **Step 6: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: sin errores; sin variables sin usar (`tip`, `TIPS` si quedan huérfanas → borrarlas).

- [ ] **Step 7: Verificación manual**

Run: app → home con y sin Camino activo.
Expected: una sola acción dominante en el primer pliegue; sin clima/cita/tip apilados; anuncios al final; sin el botón Track duplicado.

- [ ] **Step 8: Commit**

```bash
git add app/\(tabs\)/explore.tsx
git commit -m "feat(home): one dominant action, merge widgets, demote ads, drop dup track"
```

---

# FASE B — Imágenes (regeneración Gemini)

## Task 12: Reescribir los prompts de `gen-assets.mjs`

**Files:**
- Modify: `scripts/gen-assets.mjs`

- [ ] **Step 1: Reemplazar el `STYLE`**

```js
const STYLE =
  'Aesthetic: authentic, natural documentary photography of the real Camino de Santiago in Spain. ' +
  'Shot on a 35mm camera, soft natural golden-hour or overcast daylight, realistic true-to-life colors, ' +
  'gentle film grain, natural depth of field. Warm earthy palette — weathered grey stone, eucalyptus and oak greens, ' +
  'cream sky, the iconic Camino yellow arrow. Calm, grounded, hopeful, unpretentious. ' +
  'STRICTLY NO aurora borealis, NO northern lights, NO liquid metal, NO glossy 3D render, NO neon glow, ' +
  'NO surreal sky, NO holographic, NO sci-fi. No text, no words, no letters, no watermark.';
```

- [ ] **Step 2: Reemplazar los prompts de `JOBS`** (mantener `name`/`aspect`):

```js
// icon.png  (1:1)
'Flat minimalist app icon: a single bright Camino yellow arrow (#F5C518) angled slightly up-right, ' +
'hand-painted look with a slightly imperfect edge, on a solid deep forest-green (#3A5A40) rounded square ' +
'with a subtle concrete/stone texture. No gloss, no bevel, no gradient, no shell, no glow. ' +
'Looks like a real spray-painted wall waymark. Crisp, iconic, generous padding.'

// adaptive-icon.png  (1:1)
'Android adaptive icon foreground: the same flat yellow arrow (#F5C518) centered in the middle third on ' +
'deep forest-green (#3A5A40), large safe margins, simple and iconic, no clutter, no gloss.'

// splash.png  (9:16)
'Vertical splash: a real photograph of a yellow Camino arrow painted on weathered grey Galician stone at soft dawn, ' +
'calm and minimal, muted natural color, lots of negative space, deep warm vignette at the bottom, no people. ' + STYLE

// onboarding-hero.png  (9:16)
'Real photo: a yellow Camino arrow on a stone marker pointing down a eucalyptus-lined dirt path in green Galicia ' +
'at golden hour, soft mist, natural and hopeful, a genuine pilgrimage trail. ' + STYLE

// onboarding-routes.png  (9:16)
'Real photo: green rolling hills with a winding dirt Camino path through the northern Spain countryside at golden ' +
'hour, a small medieval stone village in the distance, natural documentary landscape, NO light trails. ' + STYLE

// onboarding-community.png  (9:16)
'Real candid photo: a few pilgrims with backpacks resting and talking in a stone albergue courtyard at dusk, ' +
'warm natural lantern light, a genuine human moment, soft documentary, natural faces (not blurred). ' + STYLE

// aurora-bg.png  → ELIMINAR este job del array (ya no se usa).

// home-hero.png  (9:16)  → NUEVO job
'Real photo: a Galician Camino landscape — green hills and a stone path under a soft cream sky at golden hour, ' +
'evocative and natural, room for an overlay at the bottom, no people, no text. ' + STYLE

// notification-icon.png  (1:1)  → mantener glifo blanco; opcionalmente cambiar concha por flecha:
'Simple monochrome notification glyph: a clean solid white Camino arrow silhouette, slightly up-right, ' +
'centered on pure black, flat, high contrast, no gradients, no text.'
```

- [ ] **Step 3: Actualizar el comentario de cabecera** del script (quitar "Aurora Camino — Liquid Dawn", poner "Flecha — documental auténtico").

- [ ] **Step 4: Lint del script (opcional) + commit**

```bash
git add scripts/gen-assets.mjs
git commit -m "feat(assets): rewrite Gemini prompts to authentic non-AI documentary style"
```

---

## Task 13: Cablear assets nuevos (`media.ts`, onboarding, hero, limpieza)

**Files:**
- Modify: `src/media.ts`
- Modify: `src/features/onboarding/Routes.tsx`
- Delete: `santiagoways-app/assets/generated/aurora-bg.png` (tras regenerar)

- [ ] **Step 1: Actualizar `src/media.ts`**

```ts
export const media = {
  onboardingHero: require('../assets/generated/onboarding-hero.png'),
  onboardingRoutes: require('../assets/generated/onboarding-routes.png'),
  onboardingCommunity: require('../assets/generated/onboarding-community.png'),
  homeHero: require('../assets/generated/home-hero.png'),
  icon: require('../assets/generated/icon.png'),
} as const;
```

(Se elimina `auroraBg`.)

- [ ] **Step 2: `Routes.tsx` usa la foto real en vez de `auroraBg`**

En `src/features/onboarding/Routes.tsx` (línea ~31), cambiar `media.auroraBg` por `media.onboardingRoutes`.

- [ ] **Step 3: Regenerar las imágenes (requiere `GEMINI_API_KEY`)**

```bash
cd /Users/marcosmor/Desktop/SantiagoWays
GEMINI_API_KEY=<key> node scripts/gen-assets.mjs
```

Expected: genera `icon.png`, `adaptive-icon.png`, `splash.png`, `onboarding-hero.png`, `onboarding-routes.png`, `onboarding-community.png`, `home-hero.png`, `notification-icon.png` en `santiagoways-app/assets/generated/`. Revisar visualmente que NO hay auroras/metal líquido. Iterar el prompt si hace falta.

- [ ] **Step 4: Eliminar el asset muerto**

```bash
rm santiagoways-app/assets/generated/aurora-bg.png
```

- [ ] **Step 5: Completar Task 11 Step 5** (hero local) ahora que `media.homeHero` existe.

- [ ] **Step 6: Typecheck + lint + verificación manual**

Run: `cd santiagoways-app && npm run typecheck && npm run lint`
Expected: sin errores. Manual: onboarding (3 pantallas) y home con las imágenes nuevas.

- [ ] **Step 7: Commit**

```bash
cd /Users/marcosmor/Desktop/SantiagoWays
git add santiagoways-app/src/media.ts santiagoways-app/src/features/onboarding/Routes.tsx santiagoways-app/assets/generated
git commit -m "feat(assets): wire authentic imagery, add home-hero, drop aurora-bg"
```

---

## Task 14: Icono y splash de la app (`app.json`)

**Files:**
- Modify: `santiagoways-app/app.json`
- (Posible) Create: `santiagoways-app/assets/icon.png`, `splash.png`, `adaptive-icon.png` (copias desde `generated/`)

- [ ] **Step 1: Si el icono de Gemini sale nítido**, copiar a las rutas que usa `app.json`:

```bash
cd /Users/marcosmor/Desktop/SantiagoWays/santiagoways-app/assets
cp generated/icon.png icon.png
cp generated/splash.png splash.png
cp generated/adaptive-icon.png adaptive-icon.png
```

- [ ] **Step 2: Si el icono plano NO sale nítido (fallback SVG)**

Crear un SVG hecho a mano (flecha `#F5C518` inclinada ~20° sobre cuadro `#3A5A40` con grano sutil) y exportarlo a PNG 1024×1024:

```bash
# requiere imagemagick o rsvg-convert; alternativamente exportar desde la herramienta de diseño
rsvg-convert -w 1024 -h 1024 assets/icon-flecha.svg -o assets/icon.png
```

SVG base (`assets/icon-flecha.svg`):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="224" fill="#3A5A40"/>
  <g transform="rotate(-20 512 512)" fill="none" stroke="#F5C518" stroke-width="86" stroke-linecap="round" stroke-linejoin="round">
    <line x1="300" y1="640" x2="724" y2="384"/>
    <polyline points="560,360 724,384 700,548"/>
  </g>
</svg>
```

- [ ] **Step 3: Verificar `app.json`** apunta a `./assets/icon.png`, `./assets/splash.png`, `./assets/adaptive-icon.png` (ya es así; ajustar solo si cambian nombres). Confirmar `splash.backgroundColor` a `#0B0A09`.

- [ ] **Step 4: Verificación manual**

Run: rebuild en iPhone (`scripts/run-on-iphone.sh`).
Expected: icono = flecha sobre verde (no concha gel); splash = piedra/flecha calmado (no aurora).

- [ ] **Step 5: Commit**

```bash
cd /Users/marcosmor/Desktop/SantiagoWays
git add santiagoways-app/assets santiagoways-app/app.json
git commit -m "feat(brand): flat flecha icon + calm splash, replace AI gel/aurora"
```

---

## Task 15: Verificación final

- [ ] **Step 1: Suite completa**

Run: `cd santiagoways-app && npm test && npm run typecheck && npm run lint`
Expected: tests verdes (incl. `withTimeout`, `tokens`), typecheck y lint sin errores nuevos.

- [ ] **Step 2: Repaso visual en iPhone** de: onboarding, home (con/sin Camino), iniciar Camino (con backend on/off), icono y splash.

- [ ] **Step 3: Grep de residuos** de los hex antiguos:

```bash
cd santiagoways-app
grep -rn "#FBBF24\|#FFD700\|#F0A92B\|FBBF24\|FFD700" src app | grep -v node_modules
```

Expected: vacío salvo usos intencionados. Reasignar los que queden.

- [ ] **Step 4: Merge**

Usar `superpowers:finishing-a-development-branch` para decidir merge/PR de `redesign/flecha`.

---

## Notas de cobertura (self-review)

- **D (bug):** Tasks 1-5. `withTimeout` (TDD), api timeout, uploads timeout, mutation+invalidación, finish() sin cuelgue.
- **A (color):** Tasks 6-9. Valores de token (TDD invariantes), gradientes/glows, componentes compartidos, barrido en pantallas.
- **C (home):** Tasks 10-11. HoyCard + restructura/declutter.
- **B (imágenes):** Tasks 12-14. Prompts Gemini, cableado de assets, icono/splash.
- **Verificación:** Task 15.
- **Dependencia clave:** Task 11 Step 5 depende de `media.homeHero` (Task 13). Marcado explícitamente.
- **Bloqueo externo:** Task 13 Step 3 requiere `GEMINI_API_KEY` (hoy vacía). El resto del trabajo no se bloquea.

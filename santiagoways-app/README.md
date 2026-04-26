# santiagoways-app

Expo SDK 51 / React Native 0.74 mobile client.

## Setup

```bash
cp .env.example .env             # at minimum set EXPO_PUBLIC_API_BASE_URL
npm install                      # from monorepo root
npm run app                      # or: app:ios / app:android
```

## Routes (expo-router file map)

```
app/
├── _layout.tsx                  Root: SafeArea, QueryClient, Auth bootstrap, ToastHost
├── index.tsx                    Redirects to onboarding or tabs based on auth
├── (onboarding)/welcome.tsx     5-screen horizontal carousel
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── profile-setup.tsx        3-step: avatar → bio → choose route
├── (tabs)/
│   ├── _layout.tsx              Custom TabBar (5 tabs)
│   ├── explore.tsx
│   ├── route.tsx
│   ├── map.tsx
│   ├── community.tsx
│   └── profile.tsx
├── stage/[id].tsx               Tabs: Overview · Map · Albergues · Tips
├── albergue/[id].tsx
└── post/
    ├── [id].tsx                 Detail + comments
    └── new.tsx                  Composer
```

## Design

- Tokens — `src/design/tokens.ts` (colors, type, spacing, animation springs, shadows)
- Theme — `src/design/theme.ts` (dark default, light surface tokens)
- Typography component — `src/design/text.tsx` (`<Text variant="display"/>` etc.)

Never hardcode colors. Always import from `@design/tokens`.

## State

- `@stores/auth` (Zustand) — user, sign-in, register, bootstrap on launch
- `@stores/toast` — global toasts via `toast.success/error/info`
- React Query for all server state — see `@hooks/`

## API client

`src/lib/api.ts` is a thin fetch wrapper that:
- reads tokens from `expo-secure-store`
- sets `Authorization: Bearer …`
- on 401, calls `/auth/refresh` once, retries the original request
- throws `ApiError` with status + code

## Path aliases

```
@design/*      src/design/*
@components/*  src/components/*
@features/*    src/features/*
@lib/*         src/lib/*
@stores/*      src/stores/*
@hooks/*       src/hooks/*
```

Configured in both `tsconfig.json` and `babel.config.js`.

## i18n

`src/lib/i18n.ts` — Spanish default, English fallback. Add keys to both objects.

```ts
import { t } from '@lib/i18n';
t('explore.continueButton');
```

## Notes

- The custom Camino path SVG in the onboarding hero is illustrative; replace with a higher-fidelity simplified GeoJSON if you want a perfect outline of the route.
- Mapbox custom dark/terrain style requires a development build (`eas build --profile development`); Expo Go falls back to native MapView.
- Post images currently send empty arrays; wire Cloudinary upload before publishing.

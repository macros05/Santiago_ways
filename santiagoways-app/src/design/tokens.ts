import { Platform, ViewStyle } from 'react-native';

export const colors = {
  stone950: '#0C0A09',
  stone900: '#1C1917',
  stone800: '#292524',
  stone700: '#44403C',
  stone600: '#57534E',
  stone500: '#78716C',
  stone400: '#A8A29E',
  stone300: '#D6D3D1',
  stone200: '#E7E5E4',
  stone100: '#F5F5F4',

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

  // ── Aurora / Liquid Dawn palette ────────────────────────────────────────────
  // The futuristic "pre-dawn → sunrise" spectrum that gives the app its depth.
  // Cool night blues bleed into warm ember and gold as the horizon wakes.
  ink: '#0B0A09', // warm stone-shadow base
  night: '#0B1026', // cool pre-dawn navy
  twilight: '#1A1340', // indigo twilight
  violet: '#3B2A6B', // soft aurora violet
  ember: '#7C3A12', // warm horizon ember
  horizon: '#F5C518', // retired: aliased to the single flecha yellow
  aurora1: '#5B8DEF', // luminous sky blue (cool accent)
  aurora2: '#A78BFA', // electric lavender
  aurora3: '#34D399', // mint shimmer

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // ── Semantic tints / overlays ───────────────────────────────────────────────
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

  // Stone overlays — for image scrims and modal dim layers.
  scrimWeak: 'rgba(8,7,11,0.20)',
  scrimMedium: 'rgba(8,7,11,0.55)',
  scrimStrong: 'rgba(8,7,11,0.96)',
  modalDim: 'rgba(0,0,0,0.55)',

  // ── Liquid glass surfaces ───────────────────────────────────────────────────
  // Translucent fills that sit on top of a BlurView. Kept low-alpha so the
  // frosted backdrop reads through them. Borders catch light along the top edge.
  glassFill: 'rgba(255,255,255,0.055)',
  glassFillStrong: 'rgba(255,255,255,0.085)',
  glassFillAmber: 'rgba(245,197,24,0.10)',
  glassBorder: 'rgba(255,255,255,0.14)',
  glassBorderStrong: 'rgba(255,255,255,0.22)',
  glassHighlight: 'rgba(255,255,255,0.55)', // top hairline sheen
  glassShadowInk: 'rgba(0,0,0,0.45)',
} as const;

export type ColorToken = keyof typeof colors;

// ── Gradients ─────────────────────────────────────────────────────────────────
// Tuples consumed by expo-linear-gradient. The "dawn" set is the signature
// atmosphere; "glass" sheens give surfaces their liquid, light-catching feel.
export const gradients = {
  // Full-screen ambient backdrop: night → twilight → ember whisper.
  dawn: ['#08070B', '#0E0B1F', '#1A1340', '#2A1A2E', '#0C0A09'] as const,
  // Hero overlay scrim from transparent to deep ink (bottom-anchored).
  heroScrim: ['rgba(8,7,11,0)', 'rgba(8,7,11,0.35)', 'rgba(8,7,11,0.96)'] as const,
  // Signature amber → gold sunrise, for primary CTAs and emblems.
  sunrise: ['#FCD34D', '#FBBF24', '#F0A92B', '#D97706'] as const,
  // Cool aurora ribbon for accents and progress.
  aurora: ['#5B8DEF', '#A78BFA', '#FBBF24'] as const,
  // Premium / Compostelero gold sheen.
  gold: ['#FDE68A', '#FFD700', '#D97706'] as const,
  // Subtle glass sheen (top-left highlight to transparent).
  glassSheen: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)'] as const,
  // Card base tint that lets blur show through.
  glassCard: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)'] as const,
} as const;

export type GradientToken = keyof typeof gradients;

// Type system: Fraunces (a soulful, editorial high-contrast serif) carries the
// display voice; the platform UI font (SF Pro on iOS, Roboto on Android) carries
// body/UI for an authentic, crisp Apple-grade feel. Body families resolve to
// `undefined` so React Native uses the system font and `fontWeight` controls
// weight — this also removes the previous broken custom-font references.
export const typography = {
  display: 'Fraunces_700Bold',
  displaySemibold: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  displayLight: 'Fraunces_300Light',
  body: undefined as string | undefined,
  bodyMedium: undefined as string | undefined,
  bodyBold: undefined as string | undefined,
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

// System UI font weights, applied alongside the (undefined) system family.
export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

// Apple-grade optical tracking. Large display text tightens; small caps widen.
export const tracking = {
  tighter: -1.1,
  tight: -0.5,
  normal: 0,
  wide: 0.3,
  wider: 0.8,
  widest: 1.6,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
  '4xl': 48,
  '5xl': 64,
} as const;

export const lineHeight = {
  xs: 14,
  sm: 18,
  base: 22,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 38,
  '3xl': 44,
  '4xl': 56,
  '5xl': 72,
} as const;

export const spacing = {
  px: 1,
  '0.5': 2,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const animation = {
  gentle: { damping: 20, stiffness: 120, mass: 1 },
  snappy: { damping: 15, stiffness: 200, mass: 1 },
  bouncy: { damping: 10, stiffness: 150, mass: 1 },
  slow: { damping: 25, stiffness: 80, mass: 1 },
} as const;

export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
  slower: 600,
} as const;

type Shadow = ViewStyle;
type ShadowSet = Record<'sm' | 'md' | 'lg' | 'xl', Shadow>;

const ios: ShadowSet = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
  },
};

const android: ShadowSet = {
  sm: { elevation: 2 },
  md: { elevation: 6 },
  lg: { elevation: 12 },
  xl: { elevation: 20 },
};

export const shadows: ShadowSet =
  Platform.OS === 'android' ? android : ios;

// Colored "glow" shadows for emblems and primary actions. iOS renders the soft
// colored halo; Android falls back to elevation (no tinted shadow API).
export const glow = {
  amber:
    Platform.OS === 'android'
      ? { elevation: 10 }
      : { shadowColor: '#FBBF24', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 22 },
  gold:
    Platform.OS === 'android'
      ? { elevation: 12 }
      : { shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 26 },
  aurora:
    Platform.OS === 'android'
      ? { elevation: 10 }
      : { shadowColor: '#7C7BFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 24 },
} as const;

export const layout = {
  tabBarHeight: 64,
  headerHeight: 56,
  fabSize: 56,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

export const opacity = {
  disabled: 0.5,
  pressed: 0.85,
  overlay: 0.6,
} as const;

export const z = {
  base: 0,
  raised: 10,
  sticky: 100,
  modal: 1000,
  toast: 2000,
} as const;

export type Tokens = {
  colors: typeof colors;
  gradients: typeof gradients;
  typography: typeof typography;
  weight: typeof weight;
  tracking: typeof tracking;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  spacing: typeof spacing;
  radius: typeof radius;
  animation: typeof animation;
  duration: typeof duration;
  shadows: typeof shadows;
  glow: typeof glow;
  layout: typeof layout;
  opacity: typeof opacity;
  z: typeof z;
};

export const tokens: Tokens = {
  colors,
  gradients,
  typography,
  weight,
  tracking,
  fontSize,
  lineHeight,
  spacing,
  radius,
  animation,
  duration,
  shadows,
  glow,
  layout,
  opacity,
  z,
};

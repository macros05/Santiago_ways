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

  amber300: '#FCD34D',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  cream: '#FFFBEB',
  cream100: '#FEF3C7',

  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

export const typography = {
  display: 'PlayfairDisplay-Bold',
  displayItalic: 'PlayfairDisplay-Italic',
  body: 'DMSans-Regular',
  bodyMedium: 'DMSans-Medium',
  bodyBold: 'DMSans-Bold',
  mono: 'DMSans-Mono',
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
  typography: typeof typography;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  spacing: typeof spacing;
  radius: typeof radius;
  animation: typeof animation;
  duration: typeof duration;
  shadows: typeof shadows;
  layout: typeof layout;
  opacity: typeof opacity;
  z: typeof z;
};

export const tokens: Tokens = {
  colors,
  typography,
  fontSize,
  lineHeight,
  spacing,
  radius,
  animation,
  duration,
  shadows,
  layout,
  opacity,
  z,
};

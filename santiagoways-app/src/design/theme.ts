import { colors } from './tokens';

export type ThemeMode = 'dark' | 'light';

type Surface = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentMuted: string;
  onAccent: string;
};

export const themes: Record<ThemeMode, Surface> = {
  dark: {
    background: colors.stone950,
    surface: colors.stone900,
    surfaceElevated: colors.stone800,
    border: colors.stone700,
    text: colors.cream,
    textMuted: colors.stone300,
    textSubtle: colors.stone500,
    accent: colors.amber400,
    accentMuted: colors.amber500,
    onAccent: colors.stone950,
  },
  light: {
    background: colors.cream,
    surface: colors.white,
    surfaceElevated: colors.cream100,
    border: colors.stone200,
    text: colors.stone950,
    textMuted: colors.stone700,
    textSubtle: colors.stone500,
    accent: colors.amber500,
    accentMuted: colors.amber400,
    onAccent: colors.white,
  },
};

export const defaultTheme: ThemeMode = 'dark';

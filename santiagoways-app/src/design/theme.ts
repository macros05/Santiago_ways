import { colors } from './tokens';

// SantiagoWays only ships a dark theme today. This Surface map is the single
// source of truth for any future themed component — no light variant exists
// yet because the entire app hardcodes dark surfaces; add `light` here only
// when at least one consumer wires up a theme switch.

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

export const theme: Surface = {
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
};

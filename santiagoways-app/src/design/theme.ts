import { colors } from './tokens';

// SantiagoWays ships a single, deeply atmospheric dark theme — "Liquid Dawn".
// This Surface map is the single source of truth for themed components. Add a
// `light` variant here only when a consumer wires up a theme switch.

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
  // Liquid-glass tokens for frosted, translucent surfaces.
  glass: string;
  glassStrong: string;
  glassBorder: string;
  glassHighlight: string;
};

export const theme: Surface = {
  background: colors.ink,
  surface: colors.stone900,
  surfaceElevated: colors.stone800,
  border: colors.stone700,
  text: colors.cream,
  textMuted: colors.stone300,
  textSubtle: colors.stone500,
  accent: colors.amber400,
  accentMuted: colors.amber500,
  onAccent: colors.stone950,
  glass: colors.glassFill,
  glassStrong: colors.glassFillStrong,
  glassBorder: colors.glassBorder,
  glassHighlight: colors.glassHighlight,
};

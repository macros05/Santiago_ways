import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@design/tokens';

type Variant = 'subtle' | 'default' | 'strong';

const VARIANTS: Record<Variant, [string, string]> = {
  // Top→bottom darkening so headline text is legible over a hero image.
  subtle: [colors.scrimWeak, colors.scrimStrong],
  default: ['rgba(12,10,9,0.45)', colors.scrimStrong],
  strong: ['rgba(12,10,9,0.65)', colors.scrimStrong],
};

/**
 * Standard image-darkening gradient used over hero photos in the route, stage,
 * albergue, and explore screens. Replaces an inline `LinearGradient` repeated
 * in 5+ places.
 */
export function HeroOverlay({ variant = 'default' }: { variant?: Variant }) {
  return (
    <LinearGradient
      colors={VARIANTS[variant]}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

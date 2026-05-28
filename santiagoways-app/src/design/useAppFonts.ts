import {
  useFonts,
  Fraunces_300Light,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Fraunces_600SemiBold_Italic,
} from '@expo-google-fonts/fraunces';

/**
 * Loads the Fraunces display family used by the `display*` text variants.
 * Body/UI text uses the system font (SF Pro / Roboto), so the app remains
 * fully usable even before — or if — these fonts fail to load. Callers should
 * NOT block the splash indefinitely on this: treat `[loaded || error]` as ready.
 */
export function useAppFonts(): [boolean, Error | null] {
  const [loaded, error] = useFonts({
    Fraunces_300Light,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_600SemiBold_Italic,
  });
  return [loaded, error ?? null];
}

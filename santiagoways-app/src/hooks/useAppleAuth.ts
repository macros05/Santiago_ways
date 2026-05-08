import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@stores/auth';
import { toast } from '@stores/toast';

/**
 * Apple Sign In is iOS-only (and only on devices with a real Apple ID — the
 * iOS simulator works once you sign in to System Preferences > Apple ID).
 *
 * Flow:
 * 1. signInAsync() requests an identityToken + optional name/email from Apple.
 * 2. We POST that token to /api/auth/apple, which verifies it against Apple's
 *    JWKS, looks up or creates the user, and returns our session JWTs.
 *
 * On the very first sign-in Apple sends `fullName` and `email`; on subsequent
 * ones it does not, so the backend keys off the stable `sub` claim.
 */
export function useAppleAuth() {
  const signInWithApple = useAuth((s) => s.signInWithApple);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      setAvailable(false);
      return;
    }
    AppleAuthentication.isAvailableAsync()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);

  const start = async () => {
    if (!available) {
      toast.error('Apple Sign In no está disponible en este dispositivo.');
      return;
    }
    setBusy(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        toast.error('Apple no devolvió un token válido.');
        return;
      }
      const givenName = credential.fullName?.givenName ?? '';
      const familyName = credential.fullName?.familyName ?? '';
      const fullName = [givenName, familyName].filter(Boolean).join(' ').trim();
      await signInWithApple({
        identityToken: credential.identityToken,
        name: fullName || undefined,
        email: credential.email ?? undefined,
      });
    } catch (e) {
      const code = (e as { code?: string }).code;
      // ERR_CANCELED is the user dismissing the sheet — silent on purpose.
      if (code !== 'ERR_CANCELED' && code !== 'ERR_REQUEST_CANCELED') {
        const msg = e instanceof Error ? e.message : 'Login con Apple falló.';
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return { available, busy, signIn: start };
}

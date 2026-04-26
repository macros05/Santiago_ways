import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@stores/auth';
import { toast } from '@stores/toast';

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * Returns { promptAsync, ready }.
 *
 * Flow:
 * 1. promptAsync() opens Google's auth UI in a system browser.
 * 2. Google redirects back to the Expo Auth Proxy
 *    (https://auth.expo.io/@<owner>/<slug>) which deep-links into the app.
 * 3. We grab the resulting `id_token` and POST it to /api/auth/google,
 *    which validates it via Google's tokeninfo endpoint and returns our JWT.
 *
 * IMPORTANT — to make this work you MUST add the following Authorized Redirect URI
 * to your Web OAuth client in Google Cloud Console:
 *
 *   https://auth.expo.io/@anonymous/santiagoways
 *
 * (Or @<your-expo-username>/santiagoways if you've signed in to Expo with `eas login`.)
 */
export function useGoogleAuth() {
  const signInWithGoogle = useAuth((s) => s.signInWithGoogle);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CLIENT_ID,
    iosClientId: CLIENT_ID,
    webClientId: CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        toast.error('No recibimos un id_token de Google.');
        return;
      }
      signInWithGoogle(idToken).catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Login con Google falló.';
        toast.error(msg);
      });
    } else if (response?.type === 'error') {
      toast.error(`Google: ${response.error?.message ?? 'error desconocido'}`);
    }
  }, [response, signInWithGoogle]);

  return {
    ready: !!request,
    promptAsync: () => {
      if (!CLIENT_ID) {
        toast.error('Falta EXPO_PUBLIC_GOOGLE_CLIENT_ID en .env');
        return;
      }
      promptAsync();
    },
  };
}

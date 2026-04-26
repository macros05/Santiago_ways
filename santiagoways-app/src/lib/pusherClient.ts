import Pusher from 'pusher-js/react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const ACCESS_KEY = 'sw_access_token';

const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  'http://localhost:3000/api';

let pusher: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  const key = process.env.EXPO_PUBLIC_PUSHER_KEY;
  const cluster = process.env.EXPO_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;
  if (pusher) return pusher;

  pusher = new Pusher(key, {
    cluster,
    forceTLS: true,
    channelAuthorization: {
      transport: 'ajax',
      endpoint: `${baseUrl}/chat/auth`,
      headersProvider: async () => {
        const token = await SecureStore.getItemAsync(ACCESS_KEY);
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    },
  });
  return pusher;
}

export function disconnectPusher() {
  pusher?.disconnect();
  pusher = null;
}

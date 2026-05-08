import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const ACCESS_KEY = 'sw_access_token';
const REFRESH_KEY = 'sw_refresh_token';

const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

type RequestOpts = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Json;
  query?: Record<string, string | number | undefined | null>;
  auth?: boolean;
  signal?: AbortSignal;
};

async function getTokens() {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);
  return { access, refresh };
}

export async function setTokens(access: string, refresh: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, access),
    SecureStore.setItemAsync(REFRESH_KEY, refresh),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const { refresh } = await getTokens();
    if (!refresh) return null;
    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Skip the ngrok HTML warning page when API is tunneled via ngrok-free.
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) {
      await clearTokens();
      return null;
    }
    const json = (await res.json()) as { data: { accessToken: string; refreshToken: string } };
    await setTokens(json.data.accessToken, json.data.refreshToken);
    return json.data.accessToken;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function api<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const url = new URL(`${baseUrl}${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const send = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      // Skip the ngrok HTML warning page when API is tunneled via ngrok-free.
      'ngrok-skip-browser-warning': 'true',
    };
    if (token) headers.authorization = `Bearer ${token}`;
    return fetch(url.toString(), {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  };

  const { access } = await getTokens();
  let res = await send(opts.auth === false ? null : access);

  if (res.status === 401 && opts.auth !== false) {
    const fresh = await refreshAccessToken();
    if (fresh) res = await send(fresh);
  }

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string; code?: string; details?: unknown };
    };
    throw new ApiError(
      json.error?.message ?? `Request failed (${res.status})`,
      res.status,
      json.error?.code,
      json.error?.details,
    );
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}

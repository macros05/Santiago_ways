import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@lib/api';
import { Analytics, flush, track } from '@lib/analytics';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    __reset: () => {
      store = {};
    },
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    removeItem: jest.fn(async (k: string) => {
      delete store[k];
    }),
  };
});

const STORAGE_KEY = 'sw_analytics_queue_v1';

async function drainQueue() {
  (api as jest.Mock).mockResolvedValue({});
  // Two flushes cover both batches if the queue ever overflows MAX_BATCH (20)
  // — we never push more than that here, but it's cheap insurance.
  await flush();
  await flush();
}

describe('analytics queue', () => {
  beforeEach(async () => {
    (AsyncStorage as unknown as { __reset: () => void }).__reset();
    (api as jest.Mock).mockReset();
    await drainQueue();
    (api as jest.Mock).mockReset();
  });

  it('persists events to AsyncStorage as they are tracked', async () => {
    await track('test_event', { foo: 'bar' });

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const queued = JSON.parse(raw!);
    const last = queued[queued.length - 1];
    expect(last).toMatchObject({ name: 'test_event', props: { foo: 'bar' } });
    expect(last).toHaveProperty('ts');
  });

  it('flushes events through api() and clears the queue on success', async () => {
    await track('first');
    await track('second');

    (api as jest.Mock).mockResolvedValueOnce({});
    await flush();

    expect(api).toHaveBeenCalledTimes(1);
    const [path, opts] = (api as jest.Mock).mock.calls[0]!;
    expect(path).toBe('/analytics/event');
    expect(opts.method).toBe('POST');
    const events = opts.body.events as { name: string }[];
    expect(events.map((e) => e.name)).toEqual(expect.arrayContaining(['first', 'second']));
  });

  it('retains the queue when flush throws so events are not lost on retry', async () => {
    await track('boom');

    (api as jest.Mock).mockRejectedValueOnce(new Error('network'));
    await flush();

    expect(api).toHaveBeenCalledTimes(1);
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const queue = JSON.parse(raw!);
    expect(queue.some((e: { name: string }) => e.name === 'boom')).toBe(true);
  });

  it('exposes named helpers that emit the expected event names', async () => {
    await Analytics.credentialStamp('place-slug', 'qr');
    await Analytics.communityNearbyView();

    const queue = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!) as {
      name: string;
      props?: Record<string, unknown>;
    }[];
    const names = queue.map((e) => e.name);
    expect(names).toContain('credential_stamp');
    expect(names).toContain('community_nearby_view');
    const stamp = queue.find((e) => e.name === 'credential_stamp');
    expect(stamp?.props).toEqual({ placeSlug: 'place-slug', method: 'qr' });
  });
});

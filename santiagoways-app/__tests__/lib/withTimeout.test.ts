import { withTimeout, TimeoutError } from '@lib/withTimeout';

describe('withTimeout', () => {
  afterEach(() => jest.useRealTimers());

  it('resolves with the value when fn settles before the timeout', async () => {
    const result = await withTimeout(async () => 'ok', 1000);
    expect(result).toBe('ok');
  });

  it('throws TimeoutError when fn does not settle in time', async () => {
    jest.useFakeTimers();
    const fn = (signal: AbortSignal) =>
      new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    const p = withTimeout(fn, 1000);
    const expectation = expect(p).rejects.toBeInstanceOf(TimeoutError);
    jest.advanceTimersByTime(1000);
    await expectation;
  });

  it('propagates the original error when an external signal aborts (not a timeout)', async () => {
    const external = new AbortController();
    const fn = (signal: AbortSignal) =>
      new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('external-abort')));
      });
    const p = withTimeout(fn, 10_000, external.signal);
    external.abort();
    await expect(p).rejects.toThrow('external-abort');
    await expect(p).rejects.not.toBeInstanceOf(TimeoutError);
  });
});

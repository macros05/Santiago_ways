export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Request timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Runs `fn` with an AbortSignal that fires after `ms`. If `external` aborts
 * first, that abort is forwarded and the original rejection is propagated.
 * On the internal timeout, rejects with TimeoutError.
 */
export async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  external?: AbortSignal,
): Promise<T> {
  const ctrl = new AbortController();
  let timedOut = false;

  const onExternalAbort = () => ctrl.abort();
  if (external) {
    if (external.aborted) ctrl.abort();
    else external.addEventListener('abort', onExternalAbort);
  }

  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, ms);

  try {
    return await fn(ctrl.signal);
  } catch (err) {
    if (timedOut) throw new TimeoutError(ms);
    throw err;
  } finally {
    clearTimeout(timer);
    external?.removeEventListener('abort', onExternalAbort);
  }
}

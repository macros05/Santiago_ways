import { dailyQuote } from '@lib/dailyQuote';

describe('dailyQuote', () => {
  it('is deterministic within the same day', () => {
    expect(dailyQuote('es')).toBe(dailyQuote('es'));
    expect(dailyQuote('en')).toBe(dailyQuote('en'));
  });

  it('returns a non-empty string in each locale', () => {
    expect(dailyQuote('es').length).toBeGreaterThan(0);
    expect(dailyQuote('en').length).toBeGreaterThan(0);
  });

  it('defaults to Spanish', () => {
    expect(dailyQuote()).toBe(dailyQuote('es'));
  });
});

import {
  formatKm,
  formatElevation,
  formatDuration,
  timeAgo,
  greeting,
} from '@lib/format';

describe('formatKm', () => {
  it('formats with one decimal by default', () => {
    expect(formatKm(12.345)).toBe('12.3 km');
  });
  it('respects the decimals argument', () => {
    expect(formatKm(12.345, 0)).toBe('12 km');
    expect(formatKm(5, 2)).toBe('5.00 km');
  });
});

describe('formatElevation', () => {
  it('rounds to whole metres', () => {
    expect(formatElevation(123.6)).toBe('124 m');
    expect(formatElevation(0)).toBe('0 m');
  });
});

describe('formatDuration', () => {
  it('shows minutes under an hour', () => {
    expect(formatDuration(45)).toBe('45 min');
  });
  it('shows whole hours without trailing minutes', () => {
    expect(formatDuration(120)).toBe('2h');
  });
  it('shows hours and minutes', () => {
    expect(formatDuration(150)).toBe('2h 30m');
  });
});

describe('timeAgo', () => {
  it('says "ahora" / "now" for very recent times', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now, 'es')).toBe('ahora');
    expect(timeAgo(now, 'en')).toBe('now');
  });
  it('formats minutes in each locale', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(fiveMinAgo, 'es')).toBe('hace 5 min');
    expect(timeAgo(fiveMinAgo, 'en')).toBe('5m');
  });
  it('formats hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000).toISOString();
    expect(timeAgo(threeHoursAgo, 'es')).toBe('hace 3 h');
    expect(timeAgo(threeHoursAgo, 'en')).toBe('3h');
  });
});

describe('greeting', () => {
  it('returns morning before noon', () => {
    expect(greeting(new Date(2026, 0, 1, 8, 0))).toBe('goodMorning');
  });
  it('returns afternoon between 12 and 19', () => {
    expect(greeting(new Date(2026, 0, 1, 15, 0))).toBe('goodAfternoon');
  });
  it('returns evening from 19 onwards', () => {
    expect(greeting(new Date(2026, 0, 1, 21, 0))).toBe('goodEvening');
  });
});

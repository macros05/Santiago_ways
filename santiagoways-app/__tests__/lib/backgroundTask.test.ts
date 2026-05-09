import * as TaskManager from 'expo-task-manager';
import {
  BACKGROUND_LOCATION_TASK,
  decideRegime,
  REGIME_HIGH,
  REGIME_BALANCED,
  type GpsSample,
} from '@lib/backgroundTask';

const mkSample = (offsetSec: number, lat: number, lng: number): GpsSample => ({
  lat,
  lng,
  recordedAt: new Date(1_700_000_000_000 + offsetSec * 1000).toISOString(),
});

describe('decideRegime', () => {
  it('returns High when speed > 3 km/h while in Balanced', () => {
    // Roughly 100 m in 60 s ≈ 6 km/h
    const samples: GpsSample[] = [
      mkSample(0, 42.0, -8.0),
      mkSample(30, 42.0004, -8.0),
      mkSample(60, 42.0009, -8.0),
    ];
    expect(decideRegime(samples, REGIME_BALANCED).accuracy).toBe('high');
  });

  it('drops to Balanced when speed < 1 km/h sustained ≥ 5 min', () => {
    // 5 nearly-identical points across 6 minutes ⇒ ~0 km/h throughout
    const samples: GpsSample[] = [
      mkSample(0, 42.0, -8.0),
      mkSample(90, 42.0, -8.0),
      mkSample(180, 42.0000005, -8.0),
      mkSample(270, 42.0000005, -8.0),
      mkSample(360, 42.0, -8.0),
    ];
    expect(decideRegime(samples, REGIME_HIGH).accuracy).toBe('balanced');
  });

  it('returns to High from Balanced when speed > 1 km/h', () => {
    // ~50 m in 60 s ≈ 3 km/h
    const samples: GpsSample[] = [
      mkSample(0, 42.0, -8.0),
      mkSample(60, 42.00045, -8.0),
    ];
    expect(decideRegime(samples, REGIME_BALANCED).accuracy).toBe('high');
  });

  it('keeps High when stillness span is shorter than 5 min', () => {
    // 2 minutes of stillness only — below threshold
    const samples: GpsSample[] = [
      mkSample(0, 42.0, -8.0),
      mkSample(60, 42.0, -8.0),
      mkSample(120, 42.0, -8.0),
    ];
    expect(decideRegime(samples, REGIME_HIGH).accuracy).toBe('high');
  });

  it('keeps current regime when fewer than 2 samples', () => {
    expect(decideRegime([], REGIME_HIGH)).toEqual(REGIME_HIGH);
    expect(decideRegime([mkSample(0, 42, -8)], REGIME_BALANCED)).toEqual(REGIME_BALANCED);
  });
});

describe('background task registration', () => {
  it('registers BACKGROUND_LOCATION_TASK at module load', () => {
    expect(BACKGROUND_LOCATION_TASK).toBe('sw-background-location');
    expect(TaskManager.defineTask).toHaveBeenCalledWith(
      BACKGROUND_LOCATION_TASK,
      expect.any(Function),
    );
  });
});

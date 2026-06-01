import { colors } from '@design/tokens';

// Two-colour system: GREEN (action + structure) + warm stone/cream neutrals.
// No yellow, no brass. The amber* token names are kept but point to greens.
describe('Verde Camino color system', () => {
  it('uses the vivid action green as amber400 (theme accent)', () => {
    expect(colors.amber400).toBe('#4E9D63');
  });

  it('has no yellow left in the accent ramp', () => {
    for (const v of [colors.amber300, colors.amber400, colors.amber500, colors.amber600]) {
      expect(v).not.toMatch(/^#F[0-9A-F]C|FBBF24|F5C518|FCD34D|FFD700/i);
    }
    expect(colors.horizon).not.toBe('#F5C518');
    expect(colors.warning).not.toBe('#F5C518'); // warning is clay, not yellow
  });

  it('drops the brass/gold third colour (premium reuses deep green)', () => {
    expect(colors.gold).toBe('#2F5D3E');
  });

  it('keeps the forest-green structural tier', () => {
    expect(colors.bosque).toBe('#3A5A40');
    expect(colors.musgo).toBe('#4F7A52');
    expect(colors.sendero).toBe('#2E5A3D');
  });

  it('warms the neutrals', () => {
    expect(colors.ink).toBe('#0B0A09');
    expect(colors.cream).toBe('#F7F3EA');
  });
});

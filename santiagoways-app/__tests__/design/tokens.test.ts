import { colors } from '@design/tokens';

describe('Flecha color system', () => {
  it('uses a single flecha yellow as amber400', () => {
    expect(colors.amber400).toBe('#F5C518');
  });

  it('retires the old clashing yellows', () => {
    expect(colors.amber400).not.toBe('#FBBF24');
    expect(colors.horizon).not.toBe('#F0A92B');
  });

  it('replaces gold with antique brass (premium-as-material, not a third yellow)', () => {
    expect(colors.gold).toBe('#C9A84A');
  });

  it('adds the forest-green structural tier', () => {
    expect(colors.bosque).toBe('#3A5A40');
    expect(colors.musgo).toBe('#4F7A52');
    expect(colors.sendero).toBe('#2E5A3D');
  });

  it('warms the neutrals', () => {
    expect(colors.ink).toBe('#0B0A09');
    expect(colors.cream).toBe('#F7F3EA');
  });
});

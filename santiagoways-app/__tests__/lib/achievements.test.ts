import { ACHIEVEMENTS, evaluate, type AchievementStats } from '@lib/achievements';

const ZERO: AchievementStats = {
  totalKm: 0,
  stagesCompleted: 0,
  photos: 0,
  diaryEntries: 0,
  streak: 0,
};

describe('ACHIEVEMENTS catalogue', () => {
  it('has unique ids', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('evaluate', () => {
  it('unlocks nothing for an empty pilgrim', () => {
    const unlocked = evaluate(ZERO).filter((a) => a.unlocked);
    expect(unlocked).toHaveLength(0);
  });

  it('unlocks first_steps after one stage', () => {
    const result = evaluate({ ...ZERO, stagesCompleted: 1 });
    expect(result.find((a) => a.id === 'first_steps')?.unlocked).toBe(true);
    expect(result.find((a) => a.id === 'halfway')?.unlocked).toBe(false);
  });

  it('unlocks distance milestones progressively', () => {
    const at100 = evaluate({ ...ZERO, totalKm: 100 });
    expect(at100.find((a) => a.id === '100km')?.unlocked).toBe(true);
    expect(at100.find((a) => a.id === 'compostela')?.unlocked).toBe(false);

    const at800 = evaluate({ ...ZERO, totalKm: 800 });
    expect(at800.find((a) => a.id === 'finisterre')?.unlocked).toBe(true);
  });

  it('unlocks storyteller and photographer from content stats', () => {
    const result = evaluate({ ...ZERO, diaryEntries: 5, photos: 20 });
    expect(result.find((a) => a.id === 'storyteller')?.unlocked).toBe(true);
    expect(result.find((a) => a.id === 'photographer')?.unlocked).toBe(true);
  });

  it('returns one entry per catalogue achievement', () => {
    expect(evaluate(ZERO)).toHaveLength(ACHIEVEMENTS.length);
  });
});

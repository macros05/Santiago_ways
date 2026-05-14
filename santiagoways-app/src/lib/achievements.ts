import type { Ionicons } from '@expo/vector-icons';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlock: (s: AchievementStats) => boolean;
};

export type AchievementStats = {
  totalKm: number;
  stagesCompleted: number;
  photos: number;
  diaryEntries: number;
  streak: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'Primeros pasos',
    description: 'Completa tu primera etapa',
    icon: 'footsteps',
    unlock: (s) => s.stagesCompleted >= 1,
  },
  {
    id: '100km',
    name: '100 km',
    description: 'Acumula 100 km en el Camino',
    icon: 'trophy',
    unlock: (s) => s.totalKm >= 100,
  },
  {
    id: 'halfway',
    name: 'Mitad',
    description: 'Completa 5 etapas',
    icon: 'flag',
    unlock: (s) => s.stagesCompleted >= 5,
  },
  {
    id: 'meseta',
    name: 'Meseta',
    description: 'Camina 7 días seguidos',
    icon: 'sunny',
    unlock: (s) => s.streak >= 7,
  },
  {
    id: 'compostela',
    name: 'Compostela',
    description: 'Llega a 300 km',
    icon: 'star',
    unlock: (s) => s.totalKm >= 300,
  },
  {
    id: 'finisterre',
    name: 'Finisterre',
    description: 'Completa el Camino al océano',
    icon: 'compass',
    unlock: (s) => s.totalKm >= 800,
  },
  {
    id: 'storyteller',
    name: 'Cronista',
    description: '5 entradas de diario',
    icon: 'book',
    unlock: (s) => s.diaryEntries >= 5,
  },
  {
    id: 'photographer',
    name: 'Fotógrafo',
    description: '20 fotos compartidas',
    icon: 'camera',
    unlock: (s) => s.photos >= 20,
  },
];

export function evaluate(stats: AchievementStats) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.unlock(stats) }));
}

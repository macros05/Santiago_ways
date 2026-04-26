export type SeedAchievement = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  // condition is checked client/server-side, machine readable
  condition: Record<string, unknown>;
};

export const ACHIEVEMENTS: SeedAchievement[] = [
  {
    slug: 'first-steps',
    name: 'First Steps',
    description: 'Walk your first kilometre on the Camino.',
    icon: 'footsteps',
    condition: { type: 'totalKm', value: 1 },
  },
  {
    slug: 'hundred-km-club',
    name: '100 km Club',
    description: 'Walk 100 km — eligible for the Compostela.',
    icon: 'trophy',
    condition: { type: 'totalKm', value: 100 },
  },
  {
    slug: 'halfway-there',
    name: 'Halfway There',
    description: 'Reach Sahagún or the midpoint of your route.',
    icon: 'flag',
    condition: { type: 'percentage', value: 0.5 },
  },
  {
    slug: 'meseta-survivor',
    name: 'Meseta Survivor',
    description: 'Cross the entire Meseta of the Camino Francés.',
    icon: 'sun',
    condition: { type: 'stagesRange', route: 'camino-frances', from: 13, to: 19 },
  },
  {
    slug: 'compostela',
    name: 'Compostela',
    description: 'Reach Santiago de Compostela.',
    icon: 'star',
    condition: { type: 'stageCompleted', endpoint: 'Santiago de Compostela' },
  },
  {
    slug: 'finisterre',
    name: 'End of the World',
    description: 'Continue to Cape Finisterre.',
    icon: 'compass',
    condition: { type: 'stageCompleted', endpoint: 'Finisterre' },
  },
  {
    slug: 'social-pilgrim',
    name: 'Social Pilgrim',
    description: 'Make 5 posts during your pilgrimage.',
    icon: 'people',
    condition: { type: 'postsCount', value: 5 },
  },
  {
    slug: 'photographer',
    name: 'Photographer',
    description: 'Share 25 photos.',
    icon: 'camera',
    condition: { type: 'imagesCount', value: 25 },
  },
  {
    slug: 'mountain-climber',
    name: 'Mountain Climber',
    description: 'Accumulate 5000 m of elevation gain.',
    icon: 'mountain',
    condition: { type: 'elevationGain', value: 5000 },
  },
  {
    slug: 'all-routes',
    name: 'Eternal Pilgrim',
    description: 'Complete all three primary Camino routes.',
    icon: 'medal',
    condition: { type: 'routesCompleted', value: 3 },
  },
];

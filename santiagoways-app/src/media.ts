/**
 * Static references to the bundled brand imagery (generated for the
 * "Liquid Dawn" identity). Centralised so screens import from one place and
 * Metro can statically resolve every asset.
 */
export const media = {
  onboardingHero: require('../assets/generated/onboarding-hero.png'),
  onboardingRoutes: require('../assets/generated/onboarding-routes.png'),
  onboardingCommunity: require('../assets/generated/onboarding-community.png'),
  auroraBg: require('../assets/generated/aurora-bg.png'),
  icon: require('../assets/generated/icon.png'),
} as const;

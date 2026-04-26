import { useMutation } from '@tanstack/react-query';
import { api } from '@lib/api';

export type RecType =
  | 'daily_tip'
  | 'albergue_pick'
  | 'route_planning'
  | 'hidden_gem'
  | 'weather_advice'
  | 'health_advice';

export type RecommendationResponse = {
  type: RecType;
  recommendation: string;
  tips: string[];
  confidence: number;
  contextUsed: {
    hasStage: boolean;
    hasRoute: boolean;
    hasHealth: boolean;
    hasWeather: boolean;
    hasPace: boolean;
  };
};

export type RecommendationContext = {
  stageId?: string;
  routeSlug?: string;
  kmRemaining?: number;
  mood?: string;
};

export function useAIRecommendation() {
  return useMutation({
    mutationFn: ({ type, context }: { type: RecType; context?: RecommendationContext }) =>
      api<RecommendationResponse>('/ai/recommendations', {
        method: 'POST',
        body: { type, context },
      }),
  });
}

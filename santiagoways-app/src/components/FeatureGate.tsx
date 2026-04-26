import { ReactNode, useState } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { LockedOverlay } from './LockedOverlay';
import { UpgradeBottomSheet } from './UpgradeBottomSheet';
import { useCanAccess, requiredPlanFor, type Feature } from '@hooks/useSubscription';

type Props = {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * 'overlay' (default) — render children with a blur+lock overlay on top.
   * 'replace'           — render fallback (or nothing) instead of children.
   * 'wrap'              — render children intact and intercept tap to open upgrade sheet.
   */
  mode?: 'overlay' | 'replace' | 'wrap';
  upgradeTitle?: string;
  upgradeBullets?: string[];
  style?: ViewStyle;
};

const DEFAULT_BULLETS: Record<Feature, string[]> = {
  all_routes: [
    'Acceso a Norte, Portugués, Primitivo y más',
    'Mapa completo de cada ruta',
    'Albergues con disponibilidad real',
  ],
  all_albergues: [
    'Todos los albergues de cada etapa',
    'Disponibilidad y reservas',
    'Reseñas de la comunidad',
  ],
  community_post: [
    'Comparte fotos y experiencias',
    'Comenta y sigue a otros peregrinos',
    'Tu voz en la comunidad',
  ],
  offline_maps: [
    'Mapas descargados para sin cobertura',
    'Etapas guardadas para offline',
    'GPS preciso siempre',
  ],
  unlimited_bookmarks: [
    'Guarda etapas, albergues y posts sin límite',
    'Tus favoritos siempre a mano',
    'Sin perder la cuenta',
  ],
  ai_recommendations: [
    'Tu guía personal con IA',
    'Recomendaciones basadas en tu ritmo y salud',
    'Joyas ocultas y consejos exclusivos',
  ],
  private_chat: [
    'Chat privado solo para Composteleros',
    'Conecta con peregrinos veteranos',
    'Comunidad cercana y de confianza',
  ],
  health_integration: [
    'Sincroniza Apple Health o Google Fit',
    'Tu fatiga y descanso analizados',
    'IA con datos reales de tu cuerpo',
  ],
};

const DEFAULT_TITLE: Record<Feature, string> = {
  all_routes: 'Todas las rutas del Camino',
  all_albergues: 'Ver todos los albergues',
  community_post: 'Comparte tu experiencia',
  offline_maps: 'Mapas para llevar offline',
  unlimited_bookmarks: 'Bookmarks ilimitados',
  ai_recommendations: 'Tu guía personal con IA',
  private_chat: 'Chat exclusivo Compostelero',
  health_integration: 'Conecta tu salud al Camino',
};

export function FeatureGate({
  feature,
  children,
  fallback,
  mode = 'overlay',
  upgradeTitle,
  upgradeBullets,
  style,
}: Props) {
  const allowed = useCanAccess(feature);
  const [open, setOpen] = useState(false);
  const requiredPlan = requiredPlanFor(feature);

  if (allowed) return <>{children}</>;

  const sheet = (
    <UpgradeBottomSheet
      visible={open}
      onClose={() => setOpen(false)}
      requiredPlan={requiredPlan}
      title={upgradeTitle ?? DEFAULT_TITLE[feature]}
      bullets={upgradeBullets ?? DEFAULT_BULLETS[feature]}
    />
  );

  if (mode === 'replace') {
    return (
      <>
        {fallback ?? null}
        {sheet}
      </>
    );
  }

  if (mode === 'wrap') {
    return (
      <>
        <Pressable onPress={() => setOpen(true)} style={style}>
          <View pointerEvents="none">{children}</View>
        </Pressable>
        {sheet}
      </>
    );
  }

  return (
    <View style={[{ position: 'relative' }, style]}>
      {children}
      <LockedOverlay requiredPlan={requiredPlan} onPress={() => setOpen(true)} />
      {sheet}
    </View>
  );
}

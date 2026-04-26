import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { colors, radius, spacing } from '@design/tokens';

const FEATURES = [
  { icon: 'cloud-offline-outline', title: 'Mapas offline', desc: 'Camina sin conexión.' },
  { icon: 'bed-outline', title: 'Reserva albergues', desc: 'Disponibilidad en tiempo real.' },
  { icon: 'navigate-outline', title: 'GPS', desc: 'Graba tu ruta etapa a etapa.' },
  { icon: 'people-outline', title: 'Comunidad', desc: 'Conecta con peregrinos.' },
  { icon: 'trophy-outline', title: 'Logros', desc: 'Celebra cada hito.' },
] as const;

export function Features() {
  return (
    <View style={styles.root}>
      <Text variant="display" color={colors.cream} align="center">
        Todo lo que necesitas
      </Text>
      <Text
        variant="body"
        color={colors.stone400}
        align="center"
        style={{ marginTop: spacing['3'], paddingHorizontal: spacing['8'] }}
      >
        Desde Saint-Jean hasta Santiago.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={{ marginTop: spacing['10'] }}
      >
        {FEATURES.map((f, i) => (
          <Animated.View
            key={f.title}
            entering={FadeInDown.delay(120 * i).duration(420)}
          >
            <Card style={styles.card} elevation="raised">
              <View style={styles.iconWrap}>
                <Ionicons name={f.icon} size={26} color={colors.amber400} />
              </View>
              <Text variant="bodyBold" color={colors.cream} style={{ marginTop: spacing['3'] }}>
                {f.title}
              </Text>
              <Text variant="small" color={colors.stone400} style={{ marginTop: 4 }}>
                {f.desc}
              </Text>
            </Card>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: spacing['16'],
  },
  row: {
    paddingHorizontal: spacing['5'],
    gap: spacing['3'],
  },
  card: {
    width: 180,
    height: 180,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

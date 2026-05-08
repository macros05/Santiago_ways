// Visual elevation profile rendered as an SVG path. Accepts a list of
// {distanceKm, elevation} samples; if only gain/loss totals are known, the
// caller can synthesise a smooth bell-curve approximation.
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';

type Sample = { km: number; elevation: number };

type Props = {
  samples?: Sample[];
  totalKm: number;
  elevationGain: number;
  elevationLoss: number;
  height?: number;
  color?: string;
};

// If the caller doesn't have a per-km profile, synthesise a plausible curve
// — start ↑ to gain peak, ↓ to gain - loss, ending at ground level.
function syntheticProfile(totalKm: number, gain: number, loss: number, points = 24): Sample[] {
  const peakAt = 0.45;
  const out: Sample[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    let elev: number;
    if (t <= peakAt) {
      // ease-out climb
      const x = t / peakAt;
      elev = gain * (1 - Math.pow(1 - x, 2));
    } else {
      const x = (t - peakAt) / (1 - peakAt);
      elev = gain - loss * x;
    }
    out.push({ km: Math.round(t * totalKm * 10) / 10, elevation: Math.round(elev) });
  }
  return out;
}

export function ElevationProfile({
  samples,
  totalKm,
  elevationGain,
  elevationLoss,
  height = 120,
  color = colors.amber400,
}: Props) {
  const data = samples && samples.length > 1 ? samples : syntheticProfile(totalKm, elevationGain, elevationLoss);
  const w = 320;
  const h = height;
  const padX = 12;
  const padY = 16;

  const minE = Math.min(...data.map((d) => d.elevation));
  const maxE = Math.max(...data.map((d) => d.elevation));
  const eRange = maxE - minE || 1;

  const x = (km: number) => padX + ((km / totalKm) * (w - padX * 2));
  const y = (e: number) => padY + (1 - (e - minE) / eRange) * (h - padY * 2);

  const dPath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.km).toFixed(1)} ${y(p.elevation).toFixed(1)}`)
    .join(' ');
  const fillPath = `${dPath} L${x(totalKm).toFixed(1)} ${h - padY} L${padX} ${h - padY} Z`;

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <Line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke={colors.stone700} strokeWidth={1} />
        <Path d={fillPath} fill={`${color}22`} />
        <Path d={dPath} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" />
        <SvgText x={padX} y={padY - 4} fill={colors.stone400} fontSize="9">
          {Math.round(maxE)} m
        </SvgText>
        <SvgText x={padX} y={h - 4} fill={colors.stone400} fontSize="9">
          {Math.round(minE)} m
        </SvgText>
        <SvgText x={w - padX} y={h - 4} fill={colors.stone400} fontSize="9" textAnchor="end">
          {totalKm.toFixed(0)} km
        </SvgText>
      </Svg>
      <View style={styles.legend}>
        <View style={{ flexDirection: 'row', gap: spacing['4'] }}>
          <Text variant="caption" color={colors.stone400}>
            ↗ +{elevationGain} m
          </Text>
          <Text variant="caption" color={colors.stone400}>
            ↘ -{elevationLoss} m
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.stone900,
    borderRadius: radius.md,
    paddingHorizontal: spacing['2'],
    paddingTop: spacing['1'],
    paddingBottom: spacing['2'],
    borderWidth: 1,
    borderColor: colors.stone800,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2'],
    marginTop: 4,
  },
});

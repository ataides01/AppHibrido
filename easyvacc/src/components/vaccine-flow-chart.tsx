import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
/** Valores ilustrativos — apenas visual. */
const WEEK_DATA = [
  { label: 'Seg', entrada: 840, saida: 520 },
  { label: 'Ter', entrada: 720, saida: 610 },
  { label: 'Qua', entrada: 910, saida: 480 },
  { label: 'Qui', entrada: 680, saida: 700 },
  { label: 'Sex', entrada: 950, saida: 890 },
  { label: 'Sáb', entrada: 410, saida: 360 },
];

const CHART_HEIGHT = 128;
const BAR_WIDTH = 14;

export function VaccineFlowChart() {
  const max = Math.max(
    ...WEEK_DATA.flatMap((d) => [d.entrada, d.saida]),
    1
  );

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold">Movimentação de vacinas</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Entrada × saída (dados demonstrativos)
        </ThemedText>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#27AE60' }]} />
          <ThemedText type="small" themeColor="textSecondary">
            Entrada
          </ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E67E22' }]} />
          <ThemedText type="small" themeColor="textSecondary">
            Saída
          </ThemedText>
        </View>
      </View>

      <View style={styles.chartWrap}>
        <View style={styles.barsRow}>
          {WEEK_DATA.map((d) => {
            const hIn = Math.max((d.entrada / max) * CHART_HEIGHT, 8);
            const hOut = Math.max((d.saida / max) * CHART_HEIGHT, 8);
            return (
              <View key={d.label} style={styles.col}>
                <View style={[styles.pair, { height: CHART_HEIGHT }]}>
                  <View style={styles.barColumn}>
                    <View style={[styles.barEntrada, { height: hIn, width: BAR_WIDTH }]} />
                  </View>
                  <View style={styles.barColumn}>
                    <View style={[styles.barSaida, { height: hOut, width: BAR_WIDTH }]} />
                  </View>
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={styles.dayLabel}>
                  {d.label}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    overflow: 'hidden',
  },
  header: {
    gap: Spacing.one,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartWrap: {
    paddingTop: Spacing.two,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  col: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  barColumn: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barEntrada: {
    backgroundColor: '#27AE60',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  barSaida: {
    backgroundColor: '#E67E22',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  dayLabel: {
    marginTop: Spacing.two,
    fontSize: 11,
  },
});

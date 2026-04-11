import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconBg: string;
  width: number | `${number}%`;
};

export function KpiCard({ title, value, description, icon, iconBg, width }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { width, backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}>
      <View style={styles.top}>
        <ThemedText type="smallBold" style={[styles.cardTitle, { color: theme.textSecondary }]}>
          {title}
        </ThemedText>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      </View>
      <ThemedText style={[styles.value, { color: theme.text }]}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.desc}>
        {description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  cardTitle: { fontSize: 13, flex: 1, paddingRight: Spacing.two },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 28, fontWeight: '700', marginBottom: Spacing.two, letterSpacing: -0.5 },
  desc: { fontSize: 13, lineHeight: 18 },
});

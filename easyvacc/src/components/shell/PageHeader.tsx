import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <ThemedText style={[styles.title, { color: theme.text }]}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText themeColor="textSecondary" style={styles.sub}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.four, paddingTop: Spacing.two },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  sub: { marginTop: Spacing.one, fontSize: 15, lineHeight: 22 },
});

import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

type Props = TextInputProps & {
  icon: ComponentProps<typeof Ionicons>['name'];
};

export function AuthTextField({ icon, style, ...rest }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
      <Ionicons name={icon} size={20} color={theme.textSecondary} style={styles.icon} />
      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    minHeight: 48,
    maxWidth: '100%',
  },
  icon: { marginRight: Spacing.two },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    fontSize: 16,
    outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
  } as object,
});

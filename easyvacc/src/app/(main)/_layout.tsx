import { Redirect, Slot } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { MainShell } from '@/components/shell/MainShell';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function MainLayout() {
  const { user, ready } = useAuth();
  const theme = useTheme();

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2E86DE" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (user.mustChangePassword) {
    return <Redirect href="/trocar-senha" />;
  }

  return (
    <MainShell>
      <Slot />
    </MainShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

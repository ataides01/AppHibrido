import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function Index() {
  const { user, ready } = useAuth();
  const theme = useTheme();

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2E86DE" />
      </View>
    );
  }

  if (user) {
    if (user.mustChangePassword) {
      return <Redirect href="/trocar-senha" />;
    }
    return <Redirect href="/home" />;
  }
  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

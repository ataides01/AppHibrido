import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/context/auth-context';
import { ThemePreferenceProvider } from '@/context/theme-preference-context';
import { ToastProvider } from '@/context/toast-context';

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </ToastProvider>
      </AuthProvider>
    </ThemePreferenceProvider>
  );
}

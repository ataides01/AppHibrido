import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setBusy(false);
    }, [])
  );

  async function onSubmit() {
    setBusy(true);
    const r = await login(email.trim(), password);
    setBusy(false);
    if (!r.ok) {
      toast.show(r.error ?? 'Não foi possível entrar.', 'error');
      return;
    }
    if (r.mustChangePassword) {
      toast.show('Defina uma nova senha no primeiro acesso.', 'info');
      router.replace('/trocar-senha');
      return;
    }
    toast.show('Sessão iniciada.', 'success');
    router.replace('/home');
  }

  const pageBg = theme.background === '#000000' ? '#0a0a0a' : '#E8ECEF';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: pageBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scroll,
            { minHeight: Math.max(height * 0.92, 520) },
          ]}>
          <AuthScreenLayout
            sideTitle="Bem-vindo de volta!"
            sideDescription="Para acompanhar postos, vacinas e sua carteira, entre com seu e-mail e senha."
            sideCtaLabel="CRIAR CONTA"
            href="/register">
            <ThemedText type="subtitle" style={styles.formTitle}>
              Entrar
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.formLead}>
              Use seu e-mail para acessar sua conta.
            </ThemedText>

            <View style={styles.fieldBlock}>
              <ThemedText type="smallBold">E-mail</ThemedText>
              <AuthTextField
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="seu@email.com"
              />
            </View>
            <View style={styles.fieldBlock}>
              <ThemedText type="smallBold">Senha</ThemedText>
              <AuthTextField
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
              />
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={busy}
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: '#2A9D8F', opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
              ]}>
              <ThemedText style={styles.primaryLabel}>{busy ? 'Entrando…' : 'ENTRAR'}</ThemedText>
            </Pressable>

            <ThemedView type="backgroundSelected" style={styles.hint}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.hintText}>
                Demo: admin@easyvacc.br / admin123 · paciente@easyvacc.br / 123456
              </ThemedText>
            </ThemedView>
          </AuthScreenLayout>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  formTitle: { fontSize: 22, letterSpacing: -0.3 },
  formLead: { marginBottom: Spacing.two, fontSize: 14, lineHeight: 20 },
  fieldBlock: { gap: Spacing.one, maxWidth: 400, width: '100%', alignSelf: 'center' },
  primary: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.two,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  primaryLabel: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  hint: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  hintText: { textAlign: 'center', fontSize: 12 },
});

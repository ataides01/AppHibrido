import { useFocusEffect } from '@react-navigation/native';
import { Link, router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle" style={styles.brand}>
            EasyVacc
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.lead}>
            Entre para consultar postos, vacinas e sua carteira local.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">E-mail</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="seu@email.com"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <ThemedText type="smallBold" style={styles.mt}>
              Senha
            </ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <Pressable
              onPress={onSubmit}
              disabled={busy}
              style={({ pressed }) => [
                styles.primary,
                { opacity: busy ? 0.6 : pressed ? 0.85 : 1 },
              ]}>
              <ThemedText style={styles.primaryLabel}>{busy ? 'Entrando…' : 'Entrar'}</ThemedText>
            </Pressable>
          </ThemedView>

          <View style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary">
              Não tem conta?{' '}
            </ThemedText>
            <Link href="/register">
              <ThemedText type="linkPrimary">Cadastre-se</ThemedText>
            </Link>
          </View>

          <ThemedView type="backgroundSelected" style={styles.hint}>
            <ThemedText type="small" themeColor="textSecondary">
              Demo: admin@easyvacc.br / admin123 · paciente@easyvacc.br / 123456
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    padding: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  brand: { textAlign: 'center' },
  lead: { textAlign: 'center', marginBottom: Spacing.two },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    marginTop: Spacing.one,
  },
  mt: { marginTop: Spacing.two },
  primary: {
    backgroundColor: '#27AE60',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  primaryLabel: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  hint: { padding: Spacing.three, borderRadius: Spacing.three },
});

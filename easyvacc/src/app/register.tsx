import { Link, router } from 'expo-router';
import { useState } from 'react';
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

export default function RegisterScreen() {
  const theme = useTheme();
  const { register } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    if (name.trim().length < 2) {
      toast.show('Informe seu nome.', 'error');
      return;
    }
    if (password.length < 4) {
      toast.show('Use uma senha com pelo menos 4 caracteres.', 'error');
      return;
    }
    setBusy(true);
    const r = await register(name, email, password);
    setBusy(false);
    if (!r.ok) {
      toast.show(r.error ?? 'Não foi possível cadastrar.', 'error');
      return;
    }
    toast.show('Conta criada! Bem-vindo(a).', 'success');
    router.replace('/home');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle" style={styles.title}>
            Criar conta
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.lead}>
            Pacientes podem se cadastrar para favoritar postos e manter histórico local.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Nome</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nome completo"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <ThemedText type="smallBold" style={styles.mt}>
              E-mail
            </ThemedText>
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
              placeholder="Mínimo 4 caracteres"
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
              <ThemedText style={styles.primaryLabel}>{busy ? 'Salvando…' : 'Cadastrar'}</ThemedText>
            </Pressable>
          </ThemedView>

          <View style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary">
              Já tem conta?{' '}
            </ThemedText>
            <Link href="/login">
              <ThemedText type="linkPrimary">Entrar</ThemedText>
            </Link>
          </View>
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
  title: { textAlign: 'center' },
  lead: { textAlign: 'center' },
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
    backgroundColor: '#2E86DE',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  primaryLabel: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
});

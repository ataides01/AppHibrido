import { Redirect, router } from 'expo-router';
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

import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function TrocarSenhaScreen() {
  const theme = useTheme();
  const { user, ready, completeFirstLoginPasswordChange, logout } = useAuth();
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ThemedText themeColor="textSecondary">Carregando…</ThemedText>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!user.mustChangePassword) {
    return <Redirect href="/home" />;
  }

  async function onSubmit() {
    if (pw.length < 6) {
      toast.show('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (pw !== pw2) {
      toast.show('As senhas não coincidem.', 'error');
      return;
    }
    setBusy(true);
    const r = await completeFirstLoginPasswordChange(pw);
    setBusy(false);
    if (!r.ok) {
      toast.show(r.error ?? 'Não foi possível salvar.', 'error');
      return;
    }
    toast.show('Senha atualizada. Bem-vindo(a)!', 'success');
    router.replace('/home');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Nova senha" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle" style={styles.title}>
            Primeiro acesso
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.lead}>
            Sua conta foi criada com senha provisória. Defina uma nova senha para continuar usando o
            EasyVacc.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Nova senha</ThemedText>
            <TextInput
              value={pw}
              onChangeText={setPw}
              secureTextEntry
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <ThemedText type="smallBold" style={styles.mt}>
              Confirmar senha
            </ThemedText>
            <TextInput
              value={pw2}
              onChangeText={setPw2}
              secureTextEntry
              placeholder="Repita a senha"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <Pressable
              onPress={onSubmit}
              disabled={busy}
              style={({ pressed }) => [
                styles.primary,
                { opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
              ]}>
              <ThemedText style={styles.primaryLabel}>{busy ? 'Salvando…' : 'Confirmar'}</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                void logout();
              }}
              style={styles.outline}>
              <ThemedText type="linkPrimary" style={styles.outlineText}>
                Sair e voltar ao login
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three },
  title: { fontSize: 26, lineHeight: 32 },
  lead: { marginBottom: Spacing.two },
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
  outline: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
  },
  outlineText: { textAlign: 'center' },
});

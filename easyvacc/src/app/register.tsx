import { router } from 'expo-router';
import { useState } from 'react';
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
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function RegisterScreen() {
  const theme = useTheme();
  const { height } = useWindowDimensions();
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
            { minHeight: Math.max(height * 0.92, 560) },
          ]}>
          <AuthScreenLayout
            sideTitle="Já faz parte?"
            sideDescription="Se você já tem conta, volte para a tela de login e continue de onde parou."
            sideCtaLabel="ENTRAR"
            href="/login">
            <ThemedText type="subtitle" style={styles.formTitle}>
              Criar conta
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.formLead}>
              Cadastro para pacientes: favoritos e histórico acompanham sua conta.
            </ThemedText>

            <View style={styles.fieldBlock}>
              <ThemedText type="smallBold">Nome</ThemedText>
              <AuthTextField
                icon="person-outline"
                value={name}
                onChangeText={setName}
                placeholder="Nome completo"
              />
            </View>
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
                placeholder="Mínimo 4 caracteres"
              />
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={busy}
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: '#2A9D8F', opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
              ]}>
              <ThemedText style={styles.primaryLabel}>{busy ? 'Salvando…' : 'CADASTRAR'}</ThemedText>
            </Pressable>
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
});

import * as Clipboard from 'expo-clipboard';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { PageHeader } from '@/components/shell/PageHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Employee } from '@/types/models';

function buildSimulatedEmail(name: string, email: string, provisionalPassword: string): string {
  return `Para: ${email}
Assunto: EasyVacc — senha provisória

Olá ${name},

Sua conta de funcionário foi criada. Acesse o app EasyVacc com:

E-mail: ${email}
Senha provisória: ${provisionalPassword}

No primeiro login será solicitada uma nova senha.

—
Obs.: neste protótipo o envio é apenas simulado na tela; em produção o e-mail viria do servidor.`;
}

export default function FuncionariosScreen() {
  const theme = useTheme();
  const {
    isAdmin,
    employees,
    addEmployeeSolo,
    addHistory,
    createEmployeeWithLogin,
    removeEmployee,
    apiMode,
  } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [cargo, setCargo] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [criarLogin, setCriarLogin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBody, setModalBody] = useState('');
  const [lastPw, setLastPw] = useState('');

  if (!isAdmin) {
    return <Redirect href="/home" />;
  }

  async function add() {
    if (!name.trim() || !cargo.trim()) {
      toast.show('Preencha nome e cargo.', 'error');
      return;
    }
    if (criarLogin) {
      if (!email.trim()) {
        toast.show('Informe o e-mail para criar o acesso.', 'error');
        return;
      }
      const r = await createEmployeeWithLogin({
        name: name.trim(),
        cargo: cargo.trim(),
        cpf,
        phone,
        email: email.trim(),
      });
      if (!r.ok) {
        toast.show(r.error ?? 'Não foi possível criar o acesso.', 'error');
        return;
      }
      const body = buildSimulatedEmail(name.trim(), email.trim().toLowerCase(), r.provisionalPassword ?? '');
      setModalBody(body);
      setLastPw(r.provisionalPassword ?? '');
      setModalOpen(true);
      toast.show('Acesso criado. Veja a simulação do e-mail.', 'success');
      addHistory(`Cadastrou funcionário com login: ${name.trim()}`);
      setName('');
      setCargo('');
      setCpf('');
      setPhone('');
      setEmail('');
      setCriarLogin(false);
      return;
    }

    const r = await addEmployeeSolo({
      name: name.trim(),
      cargo: cargo.trim(),
      cpf,
      phone,
    });
    if (!r.ok) {
      toast.show(r.error ?? 'Não foi possível salvar.', 'error');
      return;
    }
    setName('');
    setCargo('');
    setCpf('');
    setPhone('');
    toast.show('Profissional cadastrado.', 'success');
    addHistory(`Cadastrou funcionário ${name.trim()}`);
  }

  function removeEmp(e: Employee) {
    Alert.alert(
      'Remover',
      `Excluir ${e.name}?${e.userId ? ' A conta de login também será removida.' : ''}${apiMode ? '' : ' (lista neste aparelho.)'}`,
      [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await removeEmployee(e.id);
          toast.show('Registro removido.', 'info');
          addHistory(`Removeu funcionário ${e.name}`);
        },
      },
    ]);
  }

  async function copyAll() {
    await Clipboard.setStringAsync(modalBody);
    toast.show('Texto copiado.', 'success');
  }

  async function copyPw() {
    await Clipboard.setStringAsync(lastPw);
    toast.show('Senha copiada.', 'success');
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        style={styles.flex}>
        <PageHeader title="Gestão de equipe" subtitle="Criar contas e senhas provisórias." />
        <ThemedText themeColor="textSecondary">
          {apiMode
            ? 'Profissionais e contas ficam no servidor (easyvacc-api). Opcionalmente crie login e senha provisória — o envio por e-mail continua simulado na tela.'
            : 'Cadastro local de profissionais (somente administrador). Opcionalmente crie login e senha provisória — o envio por e-mail é simulado na tela (sem servidor).'}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.form}>
          <ThemedText type="smallBold">Novo profissional</ThemedText>
          <TextInput
            placeholder="Nome completo"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <TextInput
            placeholder="Cargo"
            placeholderTextColor={theme.textSecondary}
            value={cargo}
            onChangeText={setCargo}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <TextInput
            placeholder="CPF"
            placeholderTextColor={theme.textSecondary}
            value={cpf}
            onChangeText={setCpf}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <TextInput
            placeholder="Telefone"
            placeholderTextColor={theme.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <ThemedText type="smallBold">Criar acesso ao app</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Gera login, senha provisória e simula envio ao e-mail
              </ThemedText>
            </View>
            <Switch
              value={criarLogin}
              onValueChange={setCriarLogin}
              trackColor={{ false: theme.backgroundSelected, true: '#81C784' }}
              thumbColor={criarLogin ? '#27AE60' : theme.textSecondary}
            />
          </View>

          {criarLogin ? (
            <TextInput
              placeholder="E-mail corporativo"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          ) : null}

          <Pressable onPress={add} style={styles.primary}>
            <ThemedText style={styles.primaryText}>Salvar funcionário</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedText type="smallBold">Equipe cadastrada</ThemedText>
        {employees.map((e) => (
          <ThemedView key={e.id} type="backgroundSelected" style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">{e.name}</ThemedText>
                <ThemedText themeColor="textSecondary">{e.cargo}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  CPF {e.cpf} · {e.phone}
                </ThemedText>
                {e.loginEmail ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Acesso: {e.loginEmail}
                  </ThemedText>
                ) : null}
              </View>
              <Pressable onPress={() => removeEmp(e)} hitSlop={8}>
                <ThemedText style={{ color: '#b71c1c', fontWeight: '700' }}>✕</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        ))}

        <View style={{ height: Spacing.six }} />
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ThemedView type="background" style={styles.modalCard}>
            <ThemedText type="smallBold">Simulação de e-mail</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.modalHint}>
              Em produção, estas credenciais seriam enviadas automaticamente. Aqui você pode copiar e
              repassar com segurança ao profissional.
            </ThemedText>
            <ScrollView style={styles.modalScroll}>
              <ThemedText type="small" style={styles.mono}>
                {modalBody}
              </ThemedText>
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable onPress={copyPw} style={styles.secondaryBtn}>
                <ThemedText type="linkPrimary">Copiar só a senha</ThemedText>
              </Pressable>
              <Pressable onPress={copyAll} style={styles.secondaryBtn}>
                <ThemedText type="linkPrimary">Copiar mensagem</ThemedText>
              </Pressable>
            </View>
            <Pressable onPress={() => setModalOpen(false)} style={styles.primary}>
              <ThemedText style={styles.primaryText}>Fechar</ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  form: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  switchLabel: { flex: 1, gap: Spacing.one },
  primary: {
    backgroundColor: '#27AE60',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  card: { padding: Spacing.four, borderRadius: Spacing.three },
  cardTop: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    maxHeight: '90%',
  },
  modalHint: { marginBottom: Spacing.two },
  modalScroll: { maxHeight: 280, marginBottom: Spacing.two },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, lineHeight: 18 },
  modalActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginBottom: Spacing.two },
  secondaryBtn: { paddingVertical: Spacing.two },
});

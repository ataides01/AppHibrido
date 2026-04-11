import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { PageHeader } from '@/components/shell/PageHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useThemePreference } from '@/context/theme-preference-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { findNearestPosto } from '@/lib/geo';
import { geocodeFromViaCep } from '@/services/geocodeAddress';
import { fetchAddressByCep, type ViaCepResponse } from '@/services/viacep';
import type { Posto } from '@/types/models';
import type { ThemePref } from '@/context/theme-preference-context';

export default function PerfilScreen() {
  const theme = useTheme();
  const { pref, setPref } = useThemePreference();
  const { user, updateProfile, logout, history, addHistory, postos } = useAuth();
  const toast = useToast();
  const [cep, setCep] = useState(user?.cep ?? '');
  const [busyCep, setBusyCep] = useState(false);
  const [nearest, setNearest] = useState<{ posto: Posto; km: number } | null>(null);
  const [busyNearest, setBusyNearest] = useState(false);

  useEffect(() => {
    setCep(user?.cep ?? '');
  }, [user?.cep]);

  useEffect(() => {
    if (!user?.cidade || !user?.uf) {
      setNearest(null);
      setBusyNearest(false);
      return;
    }
    const data: ViaCepResponse = {
      cep: user.cep ?? '',
      logradouro: user.logradouro ?? '',
      bairro: user.bairro ?? '',
      complemento: '',
      localidade: user.cidade,
      uf: user.uf,
    };
    let cancelled = false;
    setBusyNearest(true);
    (async () => {
      const coords = await geocodeFromViaCep(data);
      if (cancelled) return;
      setBusyNearest(false);
      if (!coords || postos.length === 0) {
        setNearest(null);
        return;
      }
      setNearest(findNearestPosto(coords.lat, coords.lng, postos));
    })();
    return () => {
      cancelled = true;
      setBusyNearest(false);
    };
  }, [user?.cidade, user?.uf, user?.logradouro, user?.bairro, user?.cep, postos]);

  async function pickAvatar(fromCamera: boolean) {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.show('Permissão necessária para foto.', 'error');
      return;
    }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.85,
        });
    if (res.canceled || !res.assets[0]) return;
    await updateProfile({ avatarUri: res.assets[0].uri });
    toast.show('Foto atualizada.', 'success');
    addHistory('Atualizou foto do perfil');
  }

  async function onBuscarCep() {
    setBusyCep(true);
    const data = await fetchAddressByCep(cep);
    setBusyCep(false);
    if (!data) {
      toast.show('CEP não encontrado.', 'error');
      setNearest(null);
      return;
    }
    await updateProfile({
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
    });
    toast.show('Endereço preenchido via ViaCEP.', 'success');
    addHistory('Atualizou endereço (ViaCEP)');
  }

  function confirmLogout() {
    const run = () => {
      void logout();
    };
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.confirm('Deseja encerrar a sessão e poder entrar com outra conta?')) {
          run();
        }
      } catch {
        run();
      }
      return;
    }
    Alert.alert('Sair', 'Deseja encerrar a sessão e poder entrar com outra conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: run },
    ]);
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} style={styles.flex}>
        <PageHeader title="Perfil" subtitle="Conta, tema, endereço e histórico." />
        <View style={styles.avatarRow}>
          {user?.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh, { borderColor: theme.backgroundSelected }]}>
              <Ionicons name="person" size={48} color={theme.textSecondary} />
            </View>
          )}
          <View style={styles.avatarActions}>
            <Pressable onPress={() => pickAvatar(false)} style={styles.secondaryBtn}>
              <ThemedText type="linkPrimary">Galeria</ThemedText>
            </Pressable>
            <Pressable onPress={() => pickAvatar(true)} style={styles.secondaryBtn}>
              <ThemedText type="linkPrimary">Câmera</ThemedText>
            </Pressable>
          </View>
        </View>

        <ThemedText type="smallBold">{user?.name}</ThemedText>
        <ThemedText themeColor="textSecondary">{user?.email}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.role}>
          Perfil: {user?.role === 'admin' ? 'Administrador' : user?.role === 'funcionario' ? 'Equipe' : 'Paciente'}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.block}>
          <ThemedText type="smallBold">Endereço (ViaCEP)</ThemedText>
          <View style={styles.cepRow}>
            <TextInput
              value={cep}
              onChangeText={setCep}
              placeholder="00000-000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              style={[
                styles.input,
                { flex: 1, color: theme.text, borderColor: theme.backgroundSelected },
              ]}
            />
            <Pressable
              onPress={onBuscarCep}
              disabled={busyCep}
              style={[styles.cepBtn, { opacity: busyCep ? 0.6 : 1 }]}>
              <ThemedText style={{ color: '#fff', fontWeight: '700' }}>
                {busyCep ? '…' : 'Buscar'}
              </ThemedText>
            </Pressable>
          </View>
          {user?.logradouro || user?.cidade ? (
            <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
              {user.logradouro || 'Endereço'}
              {user.bairro ? `, ${user.bairro}` : ''}
              {user.cidade ? ` — ${user.cidade}/${user.uf}` : ''}
            </ThemedText>
          ) : null}

          {busyNearest ? (
            <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.three }}>
              Calculando posto mais próximo…
            </ThemedText>
          ) : nearest ? (
            <ThemedView type="backgroundSelected" style={styles.nearestBox}>
              <ThemedText type="smallBold">Posto de saúde mais próximo (estimativa)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.nearestHint}>
                Com base no endereço do CEP no mapa — valor aproximado.
              </ThemedText>
              <ThemedText type="smallBold" style={{ marginTop: Spacing.two }}>
                {nearest.posto.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {nearest.posto.address} — {nearest.posto.cidade}/{nearest.posto.uf}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
                ≈ {nearest.km.toFixed(1)} km do ponto estimado do seu endereço
              </ThemedText>
            </ThemedView>
          ) : user?.cidade && postos.length > 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
              Não foi possível estimar o posto mais próximo a partir deste CEP. Confira a aba Postos.
            </ThemedText>
          ) : null}
        </ThemedView>

        <ThemedText type="smallBold">Aparência</ThemedText>
        <View style={styles.row}>
          {(['system', 'light', 'dark'] as ThemePref[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPref(p)}
              style={[
                styles.themeChip,
                {
                  backgroundColor: pref === p ? '#2E86DE' : theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}>
              <ThemedText type="small" style={{ color: pref === p ? '#fff' : theme.text }}>
                {p === 'system' ? 'Sistema' : p === 'light' ? 'Claro' : 'Escuro'}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="smallBold">Histórico local</ThemedText>
        <ThemedView type="backgroundSelected" style={styles.history}>
          {history.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Nenhuma ação registrada ainda.
            </ThemedText>
          ) : (
            history.slice(0, 15).map((h) => (
              <ThemedText key={h.id} type="small" themeColor="textSecondary">
                • {new Date(h.at).toLocaleString('pt-BR')} — {h.label}
              </ThemedText>
            ))
          )}
        </ThemedView>

        <Pressable onPress={confirmLogout} style={styles.logout}>
          <ThemedText style={{ color: '#b71c1c', fontWeight: '700' }}>Encerrar sessão</ThemedText>
        </Pressable>

        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  avatarRow: { flexDirection: 'row', gap: Spacing.four, alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPh: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarActions: { gap: Spacing.two },
  secondaryBtn: { paddingVertical: Spacing.one },
  role: { marginTop: Spacing.one },
  block: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.two },
  cepRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  cepBtn: {
    backgroundColor: '#2E86DE',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  themeChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  history: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  logout: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  nearestBox: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  nearestHint: { marginTop: Spacing.one },
});

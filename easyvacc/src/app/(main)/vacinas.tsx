import { useMemo, useState } from 'react';
import {
  Modal,
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
import { createId } from '@/lib/id';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Vaccine, VaccineCategory, VaccineStatus } from '@/types/models';

const CAT_LABEL: Record<VaccineCategory, string> = {
  adulto: 'Adulto',
  infantil: 'Infantil',
  idoso: 'Idoso',
  geral: 'Geral',
};

const STATUS_LABEL: Record<VaccineStatus, string> = {
  disponivel: 'Disponível',
  esgotado: 'Esgotado',
};

export default function VacinasScreen() {
  const theme = useTheme();
  const { vaccines, saveVaccines, isAdmin, addHistory } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<VaccineCategory | 'todas'>('todas');
  const [st, setSt] = useState<VaccineStatus | 'todas'>('todas');
  const [modal, setModal] = useState(false);
  const [nName, setNName] = useState('');
  const [nFab, setNFab] = useState('');
  const [nDoses, setNDoses] = useState('');
  const [nCat, setNCat] = useState<VaccineCategory>('geral');
  const [nStatus, setNStatus] = useState<VaccineStatus>('disponivel');

  const filtered = useMemo(() => {
    return vaccines.filter((v) => {
      const matchQ =
        !q.trim() ||
        v.name.toLowerCase().includes(q.toLowerCase()) ||
        v.manufacturer.toLowerCase().includes(q.toLowerCase());
      const matchC = cat === 'todas' || v.category === cat;
      const matchS = st === 'todas' || v.status === st;
      return matchQ && matchC && matchS;
    });
  }, [vaccines, q, cat, st]);

  function toggleStatus(v: Vaccine) {
    if (!isAdmin) return;
    const nextStatus: VaccineStatus = v.status === 'disponivel' ? 'esgotado' : 'disponivel';
    const next = vaccines.map((x) => (x.id === v.id ? { ...x, status: nextStatus } : x));
    saveVaccines(next);
    toast.show(`Status: ${v.name} atualizado.`, 'success');
    addHistory(`Alterou status da vacina ${v.name}`);
  }

  function addVaccine() {
    if (!nName.trim() || !nFab.trim()) {
      toast.show('Preencha nome e fabricante.', 'error');
      return;
    }
    const nv: Vaccine = {
      id: createId(),
      name: nName.trim(),
      manufacturer: nFab.trim(),
      doses: nDoses.trim() || 'Conforme calendário',
      category: nCat,
      status: nStatus,
    };
    saveVaccines([nv, ...vaccines]);
    setModal(false);
    setNName('');
    setNFab('');
    setNDoses('');
    setNCat('geral');
    setNStatus('disponivel');
    toast.show('Vacina adicionada.', 'success');
    addHistory(`Cadastrou vacina ${nv.name}`);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['left', 'right']}>
      <ScreenHeader title="Vacinas" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Buscar por nome ou fabricante…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.search, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
        />

        <ThemedText type="smallBold">Categoria</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {(['todas', 'geral', 'adulto', 'infantil', 'idoso'] as const).map((c) => (
            <Pressable
              key={c}
              onPress={() => setCat(c)}
              style={[
                styles.chip,
                {
                  backgroundColor: cat === c ? '#2E86DE' : theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}>
              <ThemedText
                type="small"
                style={{ color: cat === c ? '#fff' : theme.text }}>
                {c === 'todas' ? 'Todas' : CAT_LABEL[c]}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <ThemedText type="smallBold">Status</ThemedText>
        <View style={styles.row}>
          {(['todas', 'disponivel', 'esgotado'] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSt(s)}
              style={[
                styles.chip,
                {
                  backgroundColor: st === s ? '#27AE60' : theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}>
              <ThemedText type="small" style={{ color: st === s ? '#fff' : theme.text }}>
                {s === 'todas' ? 'Todos' : STATUS_LABEL[s]}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {isAdmin ? (
          <Pressable onPress={() => setModal(true)} style={styles.addBtn}>
            <ThemedText style={styles.addBtnText}>＋ Nova vacina</ThemedText>
          </Pressable>
        ) : null}

        {filtered.map((v) => (
          <ThemedView key={v.id} type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{v.name}</ThemedText>
            <ThemedText themeColor="textSecondary">Fabricante: {v.manufacturer}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {v.doses} · {CAT_LABEL[v.category]} · {STATUS_LABEL[v.status]}
            </ThemedText>
            {isAdmin ? (
              <Pressable onPress={() => toggleStatus(v)} style={styles.mini}>
                <ThemedText type="linkPrimary">Alternar disponibilidade</ThemedText>
              </Pressable>
            ) : null}
          </ThemedView>
        ))}

        <View style={{ height: Spacing.six }} />
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ThemedView type="background" style={styles.modalCard}>
            <ThemedText type="subtitle">Nova vacina</ThemedText>
            <TextInput
              placeholder="Nome"
              placeholderTextColor={theme.textSecondary}
              value={nName}
              onChangeText={setNName}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <TextInput
              placeholder="Fabricante"
              placeholderTextColor={theme.textSecondary}
              value={nFab}
              onChangeText={setNFab}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <TextInput
              placeholder="Doses / observação"
              placeholderTextColor={theme.textSecondary}
              value={nDoses}
              onChangeText={setNDoses}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
            <ThemedText type="smallBold">Categoria</ThemedText>
            <View style={styles.rowWrap}>
              {(['geral', 'adulto', 'infantil', 'idoso'] as VaccineCategory[]).map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setNCat(c)}
                  style={[
                    styles.chip,
                    { backgroundColor: nCat === c ? '#2E86DE' : theme.backgroundElement },
                  ]}>
                  <ThemedText type="small" style={{ color: nCat === c ? '#fff' : theme.text }}>
                    {CAT_LABEL[c]}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <ThemedText type="smallBold">Status inicial</ThemedText>
            <View style={styles.row}>
              {(['disponivel', 'esgotado'] as VaccineStatus[]).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setNStatus(s)}
                  style={[
                    styles.chip,
                    { backgroundColor: nStatus === s ? '#27AE60' : theme.backgroundElement },
                  ]}>
                  <ThemedText type="small" style={{ color: nStatus === s ? '#fff' : theme.text }}>
                    {STATUS_LABEL[s]}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModal(false)} style={styles.secondary}>
                <ThemedText>Cancelar</ThemedText>
              </Pressable>
              <Pressable onPress={addVaccine} style={styles.primary}>
                <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Salvar</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  search: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  chips: { gap: Spacing.two, paddingVertical: Spacing.two },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginBottom: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  addBtn: {
    backgroundColor: '#27AE60',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700' },
  card: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.one },
  mini: { marginTop: Spacing.two },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.three, marginTop: Spacing.two },
  secondary: { padding: Spacing.three },
  primary: {
    backgroundColor: '#2E86DE',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
});

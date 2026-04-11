import { useFocusEffect } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
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
import {
  listPacientesUsers,
  loadApplications,
  registerApplication,
} from '@/lib/vaccination-demo';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { VaccineApplicationRecord } from '@/types/models';

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function AplicacoesScreen() {
  const theme = useTheme();
  const { isAdmin, vaccines, addHistory } = useAuth();
  const toast = useToast();

  const [rows, setRows] = useState<VaccineApplicationRecord[]>([]);
  const [pacientes, setPacientes] = useState<{ id: string; name: string }[]>([]);
  const [vaccineId, setVaccineId] = useState('');
  const [useFreeName, setUseFreeName] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [freeName, setFreeName] = useState('');
  const [lote, setLote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVaccineId((prev) => {
      if (prev && vaccines.some((v) => v.id === prev)) return prev;
      return vaccines[0]?.id ?? '';
    });
  }, [vaccines]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const [apps, pacs] = await Promise.all([loadApplications(), listPacientesUsers()]);
        if (cancelled) return;
        setRows(apps);
        setPacientes(pacs);
        setSelectedPatientId((prev) => {
          if (useFreeName) return prev;
          if (prev && pacs.some((p) => p.id === prev)) return prev;
          return pacs[0]?.id ?? null;
        });
      })();
      return () => {
        cancelled = true;
      };
    }, [useFreeName])
  );

  if (!isAdmin) {
    return <Redirect href="/home" />;
  }

  async function onSubmit() {
    const v = vaccines.find((x) => x.id === vaccineId);
    if (!v) {
      toast.show('Selecione uma vacina.', 'error');
      return;
    }
    let patientUserId: string | null = null;
    let patientName = '';
    if (useFreeName) {
      patientName = freeName.trim();
      if (patientName.length < 2) {
        toast.show('Informe o nome de quem recebeu a dose.', 'error');
        return;
      }
    } else {
      const p = pacientes.find((x) => x.id === selectedPatientId);
      if (!p) {
        toast.show('Selecione um paciente ou use nome avulso.', 'error');
        return;
      }
      patientUserId = p.id;
      patientName = p.name;
    }

    setBusy(true);
    try {
      await registerApplication({
        vaccine: v,
        patientUserId,
        patientName,
        lote: lote.trim() || undefined,
        vaccinesCatalog: vaccines,
      });
      toast.show('Aplicação registrada (demo).', 'success');
      addHistory(`Registrou aplicação: ${v.name} → ${patientName}`);
      setLote('');
      setFreeName('');
      const next = await loadApplications();
      setRows(next);
    } catch {
      toast.show('Não foi possível salvar.', 'error');
    } finally {
      setBusy(false);
    }
  }

  const vCurrent = vaccines.find((x) => x.id === vaccineId);

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" style={styles.flex}>
        <PageHeader
          title="Aplicações"
          subtitle="Registre vacina e paciente — dados de demonstração neste dispositivo."
        />

        <ThemedView type="backgroundElement" style={styles.form}>
          <ThemedText type="smallBold">Vacina aplicada</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {vaccines.map((x) => (
              <Pressable
                key={x.id}
                onPress={() => setVaccineId(x.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: vaccineId === x.id ? '#2E86DE' : theme.backgroundSelected,
                    borderColor: theme.backgroundSelected,
                  },
                ]}>
                <ThemedText type="small" style={{ color: vaccineId === x.id ? '#fff' : theme.text }} numberOfLines={2}>
                  {x.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
          {vCurrent ? (
            <ThemedText type="small" themeColor="textSecondary">
              {vCurrent.manufacturer} · {vCurrent.doses}
            </ThemedText>
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              Nenhuma vacina no catálogo. Cadastre em Vacinas.
            </ThemedText>
          )}

          <ThemedText type="smallBold" style={styles.mt}>
            Quem recebeu
          </ThemedText>
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => {
                setUseFreeName(false);
                if (pacientes[0]) setSelectedPatientId(pacientes[0].id);
              }}
              style={[
                styles.toggle,
                { backgroundColor: !useFreeName ? '#27AE60' : theme.backgroundSelected },
              ]}>
              <ThemedText type="small" style={{ color: !useFreeName ? '#fff' : theme.text }}>
                Paciente do app
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setUseFreeName(true)}
              style={[
                styles.toggle,
                { backgroundColor: useFreeName ? '#27AE60' : theme.backgroundSelected },
              ]}>
              <ThemedText type="small" style={{ color: useFreeName ? '#fff' : theme.text }}>
                Nome avulso
              </ThemedText>
            </Pressable>
          </View>

          {!useFreeName ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {pacientes.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Nenhum paciente cadastrado — use &quot;Nome avulso&quot; ou cadastre um paciente.
                </ThemedText>
              ) : (
                pacientes.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelectedPatientId(p.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selectedPatientId === p.id ? '#2A9D8F' : theme.backgroundSelected,
                      },
                    ]}>
                    <ThemedText
                      type="small"
                      style={{ color: selectedPatientId === p.id ? '#fff' : theme.text }}
                      numberOfLines={2}>
                      {p.name}
                    </ThemedText>
                  </Pressable>
                ))
              )}
            </ScrollView>
          ) : (
            <TextInput
              value={freeName}
              onChangeText={setFreeName}
              placeholder="Nome completo (demonstração)"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background },
              ]}
            />
          )}

          <ThemedText type="smallBold" style={styles.mt}>
            Lote (opcional)
          </ThemedText>
          <TextInput
            value={lote}
            onChangeText={setLote}
            placeholder="Ex.: LOT-2025-XY"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.background },
            ]}
          />

          <Pressable
            onPress={onSubmit}
            disabled={busy || !vaccines.length}
            style={({ pressed }) => [
              styles.submit,
              { opacity: busy || !vaccines.length ? 0.55 : pressed ? 0.9 : 1 },
            ]}>
            <ThemedText style={styles.submitLabel}>{busy ? 'Salvando…' : 'Registrar aplicação'}</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedText type="smallBold" style={styles.mt}>
          Histórico recente
        </ThemedText>
        {rows.length === 0 ? (
          <ThemedText themeColor="textSecondary">Nenhum registro.</ThemedText>
        ) : (
          rows.map((r) => (
            <ThemedView key={r.id} type="backgroundSelected" style={styles.rowCard}>
              <ThemedText type="smallBold">{r.vaccineName}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {r.patientName}
                {r.patientUserId ? ' · conta no app' : ' · sem vínculo'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatWhen(r.appliedAt)}
                {r.lote ? ` · Lote ${r.lote}` : ''}
              </ThemedText>
            </ThemedView>
          ))
        )}

        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  form: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingVertical: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    maxWidth: 200,
  },
  mt: { marginTop: Spacing.two },
  toggleRow: { flexDirection: 'row', gap: Spacing.two },
  toggle: { flex: 1, paddingVertical: 10, borderRadius: Spacing.two, alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  submit: {
    backgroundColor: '#2E86DE',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitLabel: { color: '#fff', fontWeight: '800', fontSize: 15 },
  rowCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86DE',
  },
});

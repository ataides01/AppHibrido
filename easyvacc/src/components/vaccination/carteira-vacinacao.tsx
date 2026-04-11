import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { PageHeader } from '@/components/shell/PageHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { loadWallet, pendingFromCatalog } from '@/lib/vaccination-demo';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CarteiraDose, Vaccine } from '@/types/models';

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function CarteiraVacinacao() {
  const theme = useTheme();
  const { user, vaccines } = useAuth();
  const [completed, setCompleted] = useState<CarteiraDose[]>([]);
  const [pending, setPending] = useState<Vaccine[]>([]);

  const reload = useCallback(async () => {
    if (!user?.id) return;
    const w = await loadWallet(user.id, vaccines);
    setCompleted(w.completed);
    setPending(pendingFromCatalog(vaccines, w.completed));
  }, [user?.id, vaccines]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  function vaccineName(id: string) {
    return vaccines.find((v) => v.id === id)?.name ?? id;
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} style={styles.flex} keyboardShouldPersistTaps="handled">
        <PageHeader
          title="Carteira de vacinação"
          subtitle="Doses registradas e pendentes no calendário."
        />

    

        <ThemedText type="smallBold" style={styles.sectionLabel}>
          Doses aplicadas ({completed.length})
        </ThemedText>
        {completed.length === 0 ? (
          <ThemedText themeColor="textSecondary">Nenhuma dose registrada ainda.</ThemedText>
        ) : (
          completed.map((d) => (
            <ThemedView key={`${d.vaccineId}-${d.appliedAt}`} type="backgroundSelected" style={styles.doseCard}>
              <View style={styles.doseTop}>
                <View style={[styles.badge, { backgroundColor: 'rgba(39,174,96,0.15)' }]}>
                  <ThemedText type="smallBold" style={{ color: '#1B5E20' }}>
                    Aplicada
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="smallBold">{vaccineName(d.vaccineId)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatDate(d.appliedAt)}
                {d.lote ? ` · Lote ${d.lote}` : ''}
              </ThemedText>
            </ThemedView>
          ))
        )}

        <ThemedText type="smallBold" style={[styles.sectionLabel, styles.mt]}>
          Pendentes ({pending.length})
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Vacinas do catálogo que ainda não constam na sua carteira simulada.
        </ThemedText>
        {pending.length === 0 ? (
          <ThemedText themeColor="textSecondary">Nada pendente — ótimo!</ThemedText>
        ) : (
          pending.map((v) => (
            <ThemedView key={v.id} type="backgroundElement" style={styles.pendingCard}>
              <View style={styles.pendingRow}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold">{v.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {v.doses}
                  </ThemedText>
                </View>
                <View style={[styles.badge, { backgroundColor: 'rgba(255,152,0,0.2)' }]}>
                  <ThemedText type="smallBold" style={{ color: '#E65100' }}>
                    Pendente
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          ))
        )}

        <Pressable
          onPress={() => void reload()}
          style={[styles.refresh, { borderColor: theme.backgroundSelected }]}>
          <ThemedText type="linkPrimary">Atualizar lista</ThemedText>
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
  banner: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
    borderWidth: 1,
    borderColor: 'rgba(33,150,243,0.35)',
  },
  bannerText: { lineHeight: 20 },
  sectionLabel: { marginTop: Spacing.two },
  mt: { marginTop: Spacing.four },
  hint: { marginBottom: Spacing.one },
  doseCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.one,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  doseTop: { flexDirection: 'row', justifyContent: 'flex-end' },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  pendingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  refresh: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    marginTop: Spacing.two,
  },
});

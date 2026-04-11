import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Linking,
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
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { distanceKm, mapsDirectionsUrl, mapsSearchUrl } from '@/lib/geo';
import type { Posto } from '@/types/models';

function staticMapUrl(lat: number, lng: number): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x220&maptype=mapnik`;
}

export default function PostosScreen() {
  const theme = useTheme();
  const { postos, vaccines, favoritesPostoIds, toggleFavoritePosto, addHistory } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [my, setMy] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locPending, setLocPending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setLocError('Permissão de localização negada. Distâncias ficam indisponíveis.');
            setLocPending(false);
          }
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!cancelled) {
          setMy({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocError(null);
        }
      } catch {
        if (!cancelled) setLocError('Não foi possível obter sua localização.');
      } finally {
        if (!cancelled) setLocPending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const nameByVacId = useMemo(() => {
    const m = new Map<string, string>();
    vaccines.forEach((v) => m.set(v.id, v.name));
    return m;
  }, [vaccines]);

  const sorted = useMemo(() => {
    const f = q.trim().toLowerCase();
    let list = postos.filter(
      (p) =>
        !f ||
        p.name.toLowerCase().includes(f) ||
        p.cidade.toLowerCase().includes(f) ||
        p.address.toLowerCase().includes(f)
    );
    if (my) {
      list = [...list].sort(
        (a, b) =>
          distanceKm(my.lat, my.lng, a.lat, a.lng) - distanceKm(my.lat, my.lng, b.lat, b.lng)
      );
    }
    return list;
  }, [postos, q, my]);

  async function openRoute(p: Posto) {
    if (my) {
      await Linking.openURL(mapsDirectionsUrl(my.lat, my.lng, p.lat, p.lng));
    } else {
      await Linking.openURL(mapsSearchUrl(p.lat, p.lng));
    }
    addHistory(`Abriu rota para ${p.name}`);
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} style={styles.flex1}>
        <PageHeader title="Postos de vacinação" subtitle="Distâncias, favoritos e rotas." />
        <ThemedText themeColor="textSecondary">
          Veja quais imunizações cada unidade oferece. A prévia do mapa é estática; o botão abre o
          trajeto no aplicativo de mapas.
        </ThemedText>

        {locPending ? (
          <ThemedText type="small" themeColor="textSecondary">
            Obtendo localização…
          </ThemedText>
        ) : locError ? (
          <ThemedView type="backgroundSelected" style={styles.banner}>
            <ThemedText type="small">{locError}</ThemedText>
          </ThemedView>
        ) : my ? (
          <ThemedView type="backgroundSelected" style={styles.banner}>
            <ThemedText type="smallBold">Localização ativa</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Postos ordenados pela distância aproximada até você.
            </ThemedText>
          </ThemedView>
        ) : null}

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Buscar por nome, cidade ou endereço…"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.search,
            {
              color: theme.text,
              borderColor: theme.backgroundSelected,
              backgroundColor: theme.backgroundElement,
            },
          ]}
        />

        {sorted.map((p) => {
          const dist = my != null ? distanceKm(my.lat, my.lng, p.lat, p.lng) : null;
          const fav = favoritesPostoIds.includes(p.id);
          const vacNames = p.vaccineIds.map((id) => nameByVacId.get(id) ?? id).join(' · ');
          return (
            <ThemedView key={p.id} type="backgroundElement" style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.flex1}>
                  <ThemedText type="smallBold">{p.name}</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {p.address} — {p.cidade}/{p.uf}
                  </ThemedText>
                  {dist != null ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      ≈ {dist.toFixed(1)} km
                    </ThemedText>
                  ) : null}
                </View>
                <Pressable
                  accessibilityLabel={fav ? 'Remover dos favoritos' : 'Favoritar'}
                  onPress={() => {
                    toggleFavoritePosto(p.id);
                    toast.show(fav ? 'Removido dos favoritos.' : 'Salvo nos favoritos.', 'success');
                    addHistory(`${fav ? 'Removeu favorito' : 'Favoritou'} ${p.name}`);
                  }}>
                  <ThemedText style={styles.star}>{fav ? '★' : '☆'}</ThemedText>
                </Pressable>
              </View>

              <ThemedText type="small" themeColor="textSecondary" style={styles.vacLine}>
                Vacinas: {vacNames || '—'}
              </ThemedText>

              <Image source={{ uri: staticMapUrl(p.lat, p.lng) }} style={styles.mapImg} />

              <Pressable onPress={() => openRoute(p)} style={styles.btnPrimary}>
                <ThemedText style={styles.btnPrimaryText}>
                  {my ? 'Traçar rota a partir daqui' : 'Abrir no mapa'}
                </ThemedText>
              </Pressable>
            </ThemedView>
          );
        })}

        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  banner: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  search: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  card: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.two },
  cardTop: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
  flex1: { flex: 1 },
  star: { fontSize: 22 },
  vacLine: { marginTop: Spacing.two },
  mapImg: { width: '100%', height: 120, borderRadius: Spacing.three, marginTop: Spacing.two },
  btnPrimary: {
    backgroundColor: '#2E86DE',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
});

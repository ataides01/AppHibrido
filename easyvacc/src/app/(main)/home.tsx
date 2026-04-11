import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { PageHeader } from '@/components/shell/PageHeader';
import { KpiCard } from '@/components/shell/KpiCard';
import { SIDEBAR_BREAKPOINT, SIDEBAR_WIDTH, SHELL_BLUE } from '@/components/shell/constants';
import { VaccineFlowChart } from '@/components/vaccine-flow-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchWeatherSaquaremaRJ, weatherLabel, type WeatherNow } from '@/services/weather';

export default function HomeScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { user, isAdmin, vaccines, postos, employees, favoritesPostoIds, history } = useAuth();
  const [weather, setWeather] = useState<WeatherNow | null>(null);

  const isWideShell = width >= SIDEBAR_BREAKPOINT;
  const hPad = Spacing.four * 2;
  const gutter = Spacing.three;
  const mainWidth = width - (isWideShell ? SIDEBAR_WIDTH : 0);
  const cols = width >= SIDEBAR_BREAKPOINT ? 3 : width >= 560 ? 2 : 1;
  const cardWidth = Math.max(0, (mainWidth - hPad - gutter * (cols - 1)) / cols);

  const stats = useMemo(() => {
    const total = vaccines.length;
    const disp = vaccines.filter((v) => v.status === 'disponivel').length;
    const esg = total - disp;
    const pct = total > 0 ? Math.round((disp / total) * 100) : 0;
    return { total, disp, esg, pct };
  }, [vaccines]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const w = await fetchWeatherSaquaremaRJ();
      if (!alive) return;
      setWeather(w);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <PageHeader
        title="Dashboard administrativo"
        subtitle="Visão geral do sistema de vacinação"
      />

      <ThemedText style={[styles.greeting, { color: theme.text }]}>
        Olá, {user?.name?.split(' ')[0] ?? 'visitante'}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.roleLine}>
        {isAdmin
          ? 'Modo administrador: vacinas, postos e equipe.'
          : 'Consulte vacinas nos postos e cuide do seu calendário.'}
      </ThemedText>

      <View style={[styles.grid, { gap: gutter }]}>
        <KpiCard
          title="Total de vacinas"
          value={String(stats.total)}
          description="Vacinas cadastradas no sistema"
          icon={<Ionicons name="medkit-outline" size={22} color={SHELL_BLUE} />}
          iconBg="rgba(37,99,235,0.12)"
          width={cardWidth}
        />
        <KpiCard
          title="Disponíveis"
          value={`${stats.pct}%`}
          description="Proporção em estoque (simulado)"
          icon={<Ionicons name="checkmark-circle-outline" size={22} color="#16A34A" />}
          iconBg="rgba(22,163,74,0.12)"
          width={cardWidth}
        />
        <KpiCard
          title="Postos de saúde"
          value={String(postos.length)}
          description="Unidades com dados de localização"
          icon={<Ionicons name="location-outline" size={22} color="#1E3A5F" />}
          iconBg="rgba(30,58,95,0.1)"
          width={cardWidth}
        />
        <KpiCard
          title="Itens esgotados"
          value={String(stats.esg)}
          description="Vacinas marcadas como esgotadas"
          icon={<Ionicons name="warning-outline" size={22} color="#EA580C" />}
          iconBg="rgba(234,88,12,0.12)"
          width={cardWidth}
        />
        {isAdmin ? (
          <KpiCard
            title="Equipe"
            value={String(employees.length)}
            description="Funcionários cadastrados"
            icon={<Ionicons name="people-outline" size={22} color="#7C3AED" />}
            iconBg="rgba(124,58,237,0.12)"
            width={cardWidth}
          />
        ) : (
          <KpiCard
            title="Favoritos"
            value={String(favoritesPostoIds.length)}
            description="Postos salvos no seu perfil"
            icon={<Ionicons name="heart-outline" size={22} color="#DB2777" />}
            iconBg="rgba(219,39,119,0.12)"
            width={cardWidth}
          />
        )}
        <KpiCard
          title="Atividade"
          value={String(history.length)}
          description="Registros no seu histórico recente"
          icon={<Ionicons name="trending-up-outline" size={22} color="#0891B2" />}
          iconBg="rgba(8,145,178,0.12)"
          width={cardWidth}
        />
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Clima (Open-Meteo · Saquarema, RJ)</ThemedText>
        {weather ? (
          <>
            <ThemedText style={styles.bigTemp}>{Math.round(weather.temperature)}°C</ThemedText>
            <ThemedText themeColor="textSecondary">
              {weatherLabel(weather.weathercode)} · vento {weather.windspeed.toFixed(0)} km/h
            </ThemedText>
          </>
        ) : (
          <ThemedText themeColor="textSecondary">Carregando clima…</ThemedText>
        )}
      </ThemedView>

      <VaccineFlowChart />

      <View style={styles.aiSection}>
        <ThemedText style={[styles.aiSectionTitle, { color: theme.text }]}>Análises e previsões com IA</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.aiSectionSub}>
          Insights inteligentes baseados nos dados de vacinação (demonstração).
        </ThemedText>
        <View style={[styles.aiBox, { backgroundColor: `${SHELL_BLUE}18`, borderColor: `${SHELL_BLUE}33` }]}>
          <View style={styles.aiBoxHead}>
            <View style={[styles.aiIconBg, { backgroundColor: `${SHELL_BLUE}28` }]}>
              <Ionicons name="trending-up" size={20} color={SHELL_BLUE} />
            </View>
            <ThemedText type="smallBold" style={{ color: theme.text }}>
              Previsão de demanda
            </ThemedText>
          </View>
          <ThemedText themeColor="textSecondary" style={styles.aiBody}>
            Com base na proporção atual de vacinas disponíveis ({stats.pct}%) e no número de postos ativos, o painel
            sugere monitorar reforço de estoque nas próximas semanas — cenário ilustrativo para apresentação do app.
          </ThemedText>
        </View>
      </View>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Atalhos</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Use o menu para Vacinas, Postos, Perfil e Sobre. Em telas menores, abra o menu no canto superior.
        </ThemedText>
      </ThemedView>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: Spacing.two, gap: Spacing.three },
  greeting: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  roleLine: { marginTop: -Spacing.two, fontSize: 15, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  bigTemp: { fontSize: 40, fontWeight: '700' },
  aiSection: { marginTop: Spacing.two, gap: Spacing.two },
  aiSectionTitle: { fontSize: 18, fontWeight: '700' },
  aiSectionSub: { fontSize: 14, lineHeight: 20, marginTop: -Spacing.one },
  aiBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  aiBoxHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  aiIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBody: { fontSize: 14, lineHeight: 22 },
});

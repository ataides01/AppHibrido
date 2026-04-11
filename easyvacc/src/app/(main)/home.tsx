import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { VaccineFlowChart } from '@/components/vaccine-flow-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchWeatherSaquaremaRJ, weatherLabel, type WeatherNow } from '@/services/weather';

export default function HomeScreen() {
  const theme = useTheme();
  const { user, isAdmin } = useAuth();
  const [weather, setWeather] = useState<WeatherNow | null>(null);

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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['left', 'right']}>
      <ScreenHeader title="EasyVacc" />
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.hero}>
          Olá, {user?.name?.split(' ')[0] ?? 'visitante'}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.sub}>
          {isAdmin
            ? 'Você está no modo administrador: gerencie vacinas, postos e equipe.'
            : 'Veja onde há vacinas disponíveis e planeje sua ida ao posto.'}
        </ThemedText>

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

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Atalhos</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Use as abas Vacinas e Postos para buscar, filtrar e ver distâncias. Em Perfil você ajusta
            tema, endereço (ViaCEP) e foto.
          </ThemedText>
        </ThemedView>

        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  hero: { fontSize: 28, lineHeight: 34 },
  sub: { marginTop: -Spacing.two },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  bigTemp: { fontSize: 40, fontWeight: '700' },
});

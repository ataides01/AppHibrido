import { ScrollView, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/shell/PageHeader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function InfoScreen() {
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} style={styles.flex}>
        <PageHeader title="Sobre o EasyVacc" subtitle="FAQ e informações do projeto." />
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Persistência</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Todos os dados ficam no aparelho (AsyncStorage — no navegador equivale ao uso de
            armazenamento local). Não há servidor nem banco de dados remoto neste projeto.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">PWA</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            No navegador, você pode instalar o app (quando o navegador oferecer) para acesso rápido.
            O modo offline é básico: telas já carregadas podem permanecer visíveis; APIs externas
            exigem conexão.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Integrações usadas</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ViaCEP (endereço), Open-Meteo (clima em Saquarema, RJ), mapa estático OpenStreetMap (prévia) e
            Google Maps ao abrir rota.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Versão</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            EasyVacc 1.1 · React Native + Expo
          </ThemedText>
        </ThemedView>

        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  card: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.two },
});

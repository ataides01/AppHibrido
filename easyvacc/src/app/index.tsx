import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Button from '@/components/Button';
import Header from '@/components/Header';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        <Header title="EasyVacc - Sistema de Vacinação" />

        <ThemedText type="title" style={styles.title}>
          Bem-vindo ao EasyVacc
        </ThemedText>

        <ThemedText type="default" style={styles.subtitle}>
          Aplicativo híbrido para controle de vacinação
        </ThemedText>

        <ThemedView style={styles.buttonArea}>

          <Button
            title="Ver Vacinas"
            onPress={() => router.push('/vacinas')}
          />

          <Button
            title="Cadastrar Paciente"
            onPress={() => router.push('/cadastro')}
          />

          <Button
            title="Informações"
            onPress={() => router.push('/info')}
          />

        </ThemedView>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  buttonArea: {
    width: '100%',
    marginTop: 20,
  },
});
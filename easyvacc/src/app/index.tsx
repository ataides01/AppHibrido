import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import Button from "@/components/Button";
import Header from "@/components/Header";
import Card from "@/components/Card";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView>

        <Header title="EasyVacc" />

        <ThemedText type="title" style={styles.title}>
          Sistema de Gestão de Vacinação
        </ThemedText>

        <Card
          title="Bem-vindo"
          subtitle="Aplicativo Híbrido"
          description="Controle de vacinas, cadastro de funcionários e monitoramento do sistema."
        />

        <Button
          title="Vacinas"
          onPress={() => router.push("/vacinas")}
        />

        <Button
          title="Cadastrar Funcionários"
          onPress={() => router.push("/cadastro")}
        />

        <Button
          title="Informações"
          onPress={() => router.push("/info")}
        />

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    textAlign: "center",
    marginVertical: 10
  }
});
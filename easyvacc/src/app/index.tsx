import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import Header from "@/components/Header";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>

      <Header title="EasyVacc" />

      <ThemedText type="title" style={styles.title}>
        Sistema de Gestão de Vacinação
      </ThemedText>

      <ThemedText style={styles.subtitle}>
        Controle de vacinas, funcionários e informações do sistema.
      </ThemedText>

      <Card
        title="Painel do Sistema"
        subtitle="Aplicativo Híbrido"
        description="Gerencie vacinas, cadastre profissionais da saúde e acompanhe o funcionamento do sistema EasyVacc."
      />

      <View style={styles.buttons}>

        <Button
          title="💉 Vacinas"
          onPress={() => router.push("/vacinas")}
        />

        <Button
          title="👨‍⚕️ Cadastrar Funcionários"
          onPress={() => router.push("/cadastro")}
        />

        <Button
          title="ℹ️ Informações"
          onPress={() => router.push("/info")}
        />

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f8"
  },
  title: {
    textAlign: "center",
    marginTop: 10
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 15,
    color: "gray"
  },
  buttons: {
    marginTop: 20
  }
});
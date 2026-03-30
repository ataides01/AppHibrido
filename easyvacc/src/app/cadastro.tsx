import { StyleSheet, View, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { ThemedText } from "@/components/themed-text";

export default function CadastroScreen() {
  return (
    <SafeAreaView style={styles.container}>

      <Header title="Cadastro de Funcionários" />

      <ThemedText type="title" style={styles.title}>
        Cadastrar Profissional
      </ThemedText>

      <ScrollView>

        <TextInput
          placeholder="Nome do Funcionário"
          style={styles.input}
        />

        <TextInput
          placeholder="Cargo"
          style={styles.input}
        />

        <TextInput
          placeholder="CPF"
          style={styles.input}
        />

        <TextInput
          placeholder="Telefone"
          style={styles.input}
        />

        <Button title="Salvar Funcionário" onPress={() => {}} />

        <ThemedText style={styles.subtitle}>
          Funcionários cadastrados
        </ThemedText>

        <Card
          title="João Silva"
          subtitle="Enfermeiro"
          description="CPF: 000.000.000-00"
        />

        <Card
          title="Maria Souza"
          subtitle="Técnica de Enfermagem"
          description="CPF: 111.111.111-11"
        />

      </ScrollView>

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
    marginBottom: 10
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 10
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  }
});
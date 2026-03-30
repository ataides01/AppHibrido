import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { ThemedText } from "@/components/themed-text";

export default function VacinasScreen() {
  return (
    <SafeAreaView style={styles.container}>

      <Header title="Vacinas Disponíveis" />

      <ThemedText type="title" style={styles.title}>
        Lista de Vacinas
      </ThemedText>

      <ThemedText style={styles.subtitle}>
        Vacinas cadastradas no sistema EasyVacc
      </ThemedText>

      <ScrollView>

        <Card
          title="COVID-19"
          subtitle="Fabricante: Pfizer"
          description="Dose: 1ª Dose | Status: Disponível"
        />

        <Card
          title="Influenza"
          subtitle="Fabricante: Butantan"
          description="Dose: Anual | Status: Disponível"
        />

        <Card
          title="Hepatite B"
          subtitle="Fabricante: Fiocruz"
          description="Dose: 3 Doses | Status: Disponível"
        />

        <Card
          title="Febre Amarela"
          subtitle="Fabricante: Bio-Manguinhos"
          description="Dose: Única | Status: Disponível"
        />

        <Card
          title="Tríplice Viral"
          subtitle="Fabricante: SUS"
          description="Dose: 2 Doses | Status: Disponível"
        />

      </ScrollView>

      <View style={styles.buttonArea}>
        <Button title="➕ Adicionar Nova Vacina" onPress={() => {}} />
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
    color: "gray",
    marginBottom: 10
  },
  buttonArea: {
    marginTop: 10
  }
});
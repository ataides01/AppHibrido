import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Header";
import Card from "@/components/Card";
import { ThemedText } from "@/components/themed-text";

export default function InfoScreen() {
  return (
    <SafeAreaView style={styles.container}>

      <Header title="Informações do Sistema" />

      <ScrollView>

        <Card
          title="EasyVacc"
          subtitle="Sistema de Vacinação"
          description="Aplicativo híbrido desenvolvido para controle de vacinas e profissionais."
        />

        <Card
          title="Versão"
          subtitle="1.0"
          description="Projeto acadêmico"
        />

        <Card
          title="Tecnologias"
          subtitle="React Native + Expo"
          description="Sistema multiplataforma"
        />

        <Card
          title="Objetivo"
          subtitle="Gestão de saúde"
          description="Facilitar controle de vacinação"
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
  }
});
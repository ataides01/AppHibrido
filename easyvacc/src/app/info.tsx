import { View, StyleSheet, Text } from "react-native";
import Header from "@/components/Header";

export default function Info() {
  return (
    <View style={styles.container}>

      <Header title="Informações do Sistema" />

      <Text style={styles.text}>
        EasyVacc é um aplicativo híbrido desenvolvido para controle de vacinação.
      </Text>

      <Text style={styles.text}>
        Tecnologias utilizadas:
      </Text>

      <Text style={styles.text}>
        React Native
      </Text>

      <Text style={styles.text}>
        Expo
      </Text>

      <Text style={styles.text}>
        JavaScript e TypeScript
      </Text>

      <Text style={styles.text}>
        Projeto acadêmico.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  text: {
    fontSize: 16,
    marginVertical: 5
  }
});
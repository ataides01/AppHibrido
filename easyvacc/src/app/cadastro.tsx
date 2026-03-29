import { View, Text } from "react-native";
import Header from "../components/Header";

export default function Cadastro() {
  return (
    <View>
      <Header title="Cadastro de Paciente" />

      <Text style={{ padding: 20 }}>
        Tela de cadastro de pacientes.
      </Text>
    </View>
  );
}
import { View, Text } from "react-native";
import Header from "../components/Header";

export default function Info() {
  return (
    <View>
      <Header title="Informações" />

      <Text style={{ padding: 20 }}>
        Informações sobre o sistema EasyVacc.
      </Text>
    </View>
  );
}
import { View, Text } from "react-native";
import Header from "@/components/Header";

export default function Vacinas() {
  return (
    <View>
      <Header title="Lista de Vacinas" />
      <Text style={{ padding: 20 }}>
        Aqui aparecerão as vacinas cadastradas.
      </Text>
    </View>
  );
}
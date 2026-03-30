import { View, ScrollView, StyleSheet } from "react-native";
import Header from "@/components/Header";
import Card from "@/components/Card";

export default function Vacinas() {

  const vacinas = [
    {
      nome: "COVID-19",
      fabricante: "Pfizer",
      descricao: "Dose anual recomendada"
    },
    {
      nome: "Influenza",
      fabricante: "Butantan",
      descricao: "Campanha anual"
    },
    {
      nome: "Hepatite B",
      fabricante: "Fiocruz",
      descricao: "3 doses obrigatórias"
    },
    {
      nome: "Tétano",
      fabricante: "Instituto Butantan",
      descricao: "Reforço a cada 10 anos"
    }
  ];

  return (
    <ScrollView style={styles.container}>

      <Header title="Lista de Vacinas" />

      {vacinas.map((v, index) => (
        <Card
          key={index}
          title={v.nome}
          subtitle={v.fabricante}
          description={v.descricao}
        />
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  }
});
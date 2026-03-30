import { View, TextInput, StyleSheet, Alert } from "react-native";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { useState } from "react";

export default function Cadastro() {

  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");

  function cadastrar() {
    Alert.alert("Funcionário cadastrado", nome + " - " + cargo);
    setNome("");
    setCargo("");
  }

  return (
    <View style={styles.container}>

      <Header title="Cadastro de Funcionários" />

      <TextInput
        placeholder="Nome do funcionário"
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        placeholder="Cargo"
        style={styles.input}
        value={cargo}
        onChangeText={setCargo}
      />

      <Button
        title="Cadastrar"
        onPress={cadastrar}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8
  }
});
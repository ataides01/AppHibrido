import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Header({ title }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2E86DE",
    padding: 15,
    alignItems: "center"
  },
  text: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold"
  }
});
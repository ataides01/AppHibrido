import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Button({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#27AE60",
    padding: 12,
    margin: 10,
    borderRadius: 8,
    alignItems: "center"
  },
  text: {
    color: "#fff",
    fontSize: 16
  }
});
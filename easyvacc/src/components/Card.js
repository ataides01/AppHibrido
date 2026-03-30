import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Card({ title, subtitle, description }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    marginTop: 10
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  },
  subtitle: {
    color: "gray",
    marginBottom: 5
  },
  description: {
    fontSize: 14
  }
});
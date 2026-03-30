import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AppTabs() {
  return (
    <Tabs>

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={20} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="vacinas"
        options={{
          title: "Vacinas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="medkit" size={20} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="cadastro"
        options={{
          title: "Funcionários",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={20} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="info"
        options={{
          title: "Info",
          tabBarIcon: ({ color }) => (
            <Ionicons name="information-circle" size={20} color={color} />
          )
        }}
      />

    </Tabs>
  );
}
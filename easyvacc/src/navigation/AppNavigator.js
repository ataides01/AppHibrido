import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import VacinasScreen from "../screens/VacinasScreen";
import CadastroScreen from "../screens/CadastroScreen";
import InfoScreen from "../screens/InfoScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: "EasyVacc" }}
        />

        <Stack.Screen 
          name="Vacinas" 
          component={VacinasScreen} 
        />

        <Stack.Screen 
          name="Cadastro" 
          component={CadastroScreen} 
        />

        <Stack.Screen 
          name="Informacoes" 
          component={InfoScreen} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
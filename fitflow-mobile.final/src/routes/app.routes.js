// src/routes/app.routes.js
// Stack principal — montada apenas quando HÁ usuário autenticado.
// Envolve as Tabs e o formulário de treino (cadastro/edição) "por cima" delas.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabRoutes from './tab.routes';
import TreinoForm from '../screens/treinos/TreinoForm';

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabRoutes} options={{ animation: 'fade' }} />
      {/* Sem treinoId → cadastro (Create). Com treinoId → edição (Update). */}
      <Stack.Screen name="TreinoForm" component={TreinoForm} />
    </Stack.Navigator>
  );
}

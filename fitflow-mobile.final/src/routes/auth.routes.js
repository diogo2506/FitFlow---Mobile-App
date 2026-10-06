// src/routes/auth.routes.js
// Stack de autenticação — montada apenas quando NÃO há usuário logado.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../screens/auth/Login';
import Cadastro from '../screens/auth/Cadastro';
import EsqueciSenha from '../screens/auth/EsqueciSenha';

const Stack = createNativeStackNavigator();

export default function AuthRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenha} />
    </Stack.Navigator>
  );
}

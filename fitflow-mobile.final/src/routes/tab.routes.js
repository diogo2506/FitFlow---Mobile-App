// src/routes/tab.routes.js
// Navegação por abas inferiores — telas principais após o login.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import Home from '../screens/Home';
import ListaTreinos from '../screens/treinos/ListaTreinos';
import Semana from '../screens/treinos/Semana';
import Perfil from '../screens/Perfil';
import { COLORS, FONTS } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Inicio: 'home',
            MeusTreinos: 'list',
            Semana: 'calendar',
            Perfil: 'user',
          };
          const name = icons[route.name] ?? 'circle';
          return (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Feather name={name} size={focused ? 22 : 20} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={Home} options={{ tabBarLabel: 'Início' }} />
      <Tab.Screen name="MeusTreinos" component={ListaTreinos} options={{ tabBarLabel: 'Treinos' }} />
      <Tab.Screen name="Semana" component={Semana} options={{ tabBarLabel: 'Semana' }} />
      <Tab.Screen name="Perfil" component={Perfil} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 65,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  iconWrapper: {
    width: 38,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  iconWrapperActive: {
    backgroundColor: COLORS.primary + '22',
  },
});

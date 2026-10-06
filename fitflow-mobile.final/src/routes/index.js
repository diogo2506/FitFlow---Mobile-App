// src/routes/index.js
// Ponto de entrada da navegação.
//
// Esta é a peça que garante a PROTEÇÃO DE ROTAS: enquanto `isAuthenticated`
// for false, a árvore de navegação só contém Login/Cadastro/Esqueci a senha
// (AuthRoutes) — as telas internas (Treinos, Semana, Perfil...) sequer
// existem no navigator, então não há como "pular" para elas. Assim que o
// Firebase Auth confirma o usuário, o AuthContext atualiza
// `isAuthenticated` e o AppRoutes é montado no lugar.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';
import AuthRoutes from './auth.routes';
import AppRoutes from './app.routes';
import { firebaseConfigurado } from '../config/firebaseConfig';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function Routes() {
  const { isAuthenticated, carregandoSessao } = useAuth();

  if (!firebaseConfigurado) {
    // Ajuda no primeiro setup: evita erros confusos do Firebase.
    return (
      <View style={styles.aviso}>
        <Feather name="settings" size={36} color={COLORS.primary} />
        <Text style={styles.avisoTitulo}>Configure o Firebase</Text>
        <Text style={styles.avisoTexto}>
          Preencha as credenciais do seu projeto em{'\n'}
          <Text style={styles.avisoCodigo}>src/config/firebaseConfig.js</Text>
          {'\n'}e recarregue o app.
        </Text>
      </View>
    );
  }

  if (carregandoSessao) {
    // Firebase restaurando a sessão do AsyncStorage — evita "piscar" a tela de login.
    return <LoadingOverlay mensagem="Preparando o FitFlow..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppRoutes /> : <AuthRoutes />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  avisoTitulo: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: '800' },
  avisoTexto: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, textAlign: 'center', lineHeight: 22 },
  avisoCodigo: { fontWeight: '700', color: COLORS.primary },
});

// src/screens/auth/EsqueciSenha.js
// Tela 3: Esqueci minha senha — envia o e-mail de redefinição do Firebase
// Authentication (sendPasswordResetEmail) via AuthContext.recuperarSenha().

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { mensagemErroFirebase } from '../../utils/firebaseErros';
import { avisar } from '../../utils/alertas';

export default function EsqueciSenha({ navigation, route }) {
  const { recuperarSenha, processando } = useAuth();

  const [email, setEmail] = useState(route.params?.email || '');
  const [erro, setErro] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const validar = () => {
    if (!email.trim()) return 'E-mail é obrigatório.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'E-mail inválido.';
    return null;
  };

  const handleEnviar = async () => {
    const msgErro = validar();
    setErro(msgErro);
    if (msgErro) return;
    try {
      await recuperarSenha(email.trim());
      setEnviado(true);
    } catch (error) {
      avisar('Erro', mensagemErroFirebase(error, 'Não foi possível enviar o e-mail. Tente novamente.'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Recuperar senha" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Feather name={enviado ? 'check' : 'key'} size={30} color={enviado ? COLORS.success : COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>{enviado ? 'E-mail enviado!' : 'Esqueceu a senha?'}</Text>
            <Text style={styles.heroSubtitle}>
              {enviado
                ? `Enviamos um link de redefinição para ${email.trim()}. Confira sua caixa de entrada (e o spam).`
                : 'Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.'}
            </Text>
          </View>

          {enviado ? (
            <>
              <View style={styles.dicaBox}>
                <Feather name="info" size={14} color={COLORS.primary} />
                <Text style={styles.dicaText}>
                  Depois de redefinir a senha, volte aqui e entre com a nova senha.
                </Text>
              </View>
              <PrimaryButton label="VOLTAR PARA O LOGIN" icon="log-in" onPress={() => navigation.navigate('Login')} />
              <PrimaryButton
                label="Reenviar e-mail"
                variant="outline"
                onPress={handleEnviar}
                loading={processando}
                style={{ marginTop: SPACING.md }}
              />
            </>
          ) : (
            <>
              <CustomInput
                label="E-mail *"
                icon="mail"
                placeholder="aluno@fitflow.com"
                value={email}
                onChangeText={(t) => { setEmail(t); setErro(null); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={erro}
              />
              <PrimaryButton
                label="ENVIAR LINK"
                icon="send"
                onPress={handleEnviar}
                loading={processando}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  heroSection: { alignItems: 'center', marginBottom: SPACING.xxl, marginTop: SPACING.lg },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  dicaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dicaText: { flex: 1, color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
});

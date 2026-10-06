// src/screens/auth/Cadastro.js
// Tela 2: Cadastro — cria a conta no Firebase Authentication
// (createUserWithEmailAndPassword) via AuthContext.registrar(), grava o nome
// no perfil do Auth e cria o documento usuarios/{uid} no Firestore
// (nome, e-mail e telefone — a senha NUNCA é salva no banco).

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { mensagemErroFirebase } from '../../utils/firebaseErros';
import { avisar } from '../../utils/alertas';

export default function Cadastro({ navigation }) {
  const { registrar, processando } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erros, setErros] = useState({});

  const validar = () => {
    const e = {};
    if (!nome.trim()) e.nome = 'Nome completo é obrigatório.';
    if (!email.trim()) e.email = 'E-mail é obrigatório.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido.';
    if (!telefone.trim()) e.telefone = 'Telefone é obrigatório.';
    else if (telefone.replace(/\D/g, '').length < 8) e.telefone = 'Telefone inválido.';
    if (!senha) e.senha = 'Senha é obrigatória.';
    else if (senha.length < 6) e.senha = 'Senha deve ter no mínimo 6 caracteres.';
    if (senha !== confirmarSenha) e.confirmarSenha = 'As senhas não coincidem.';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleCadastrar = async () => {
    if (!validar()) return;
    try {
      await registrar({ nome: nome.trim(), email: email.trim(), telefone: telefone.trim(), senha });
      // A troca para o app principal acontece sozinha (isAuthenticated muda).
    } catch (error) {
      avisar('Erro no cadastro', mensagemErroFirebase(error, 'Não foi possível criar sua conta. Tente novamente.'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Criar Conta" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heroSection}>
            <View style={styles.avatarCircle}>
              <Feather name="user-plus" size={30} color={COLORS.primary} />
            </View>
            <Text style={styles.heroTitle}>Novo Aluno</Text>
            <Text style={styles.heroSubtitle}>
              Cadastre-se para montar sua rotina de treinos e acompanhar seu progresso
            </Text>
          </View>

          <CustomInput
            label="Nome completo *"
            icon="user"
            placeholder="Maria da Silva"
            value={nome}
            onChangeText={(t) => { setNome(t); setErros((e) => ({ ...e, nome: null })); }}
            autoCapitalize="words"
            error={erros.nome}
          />

          <CustomInput
            label="E-mail *"
            icon="mail"
            placeholder="aluno@fitflow.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setErros((e) => ({ ...e, email: null })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={erros.email}
          />

          <CustomInput
            label="Telefone *"
            icon="phone"
            placeholder="(11) 91234-5678"
            value={telefone}
            onChangeText={(t) => { setTelefone(t); setErros((e) => ({ ...e, telefone: null })); }}
            keyboardType="phone-pad"
            error={erros.telefone}
          />

          <View style={styles.senhaWrapper}>
            <CustomInput
              label="Senha *"
              icon="lock"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={(t) => { setSenha(t); setErros((e) => ({ ...e, senha: null })); }}
              secureTextEntry={!senhaVisivel}
              error={erros.senha}
            />
            <TouchableOpacity style={styles.senhaToggle} onPress={() => setSenhaVisivel((v) => !v)}>
              <Feather name={senhaVisivel ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <CustomInput
            label="Confirmar senha *"
            icon="check-circle"
            placeholder="Repita sua senha"
            value={confirmarSenha}
            onChangeText={(t) => {
              setConfirmarSenha(t);
              setErros((e) => ({ ...e, confirmarSenha: null }));
            }}
            secureTextEntry={!senhaVisivel}
            error={erros.confirmarSenha}
          />

          <PrimaryButton
            label="CRIAR CONTA"
            icon="user-check"
            onPress={handleCadastrar}
            loading={processando}
            style={{ marginTop: SPACING.sm }}
          />

          <TouchableOpacity style={styles.linkLogin} onPress={() => navigation.goBack()}>
            <Text style={styles.linkLoginText}>
              Já tem conta? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  heroSection: { alignItems: 'center', marginBottom: SPACING.xxl },
  avatarCircle: {
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
    maxWidth: 280,
  },
  senhaWrapper: { position: 'relative' },
  senhaToggle: {
    position: 'absolute',
    right: SPACING.lg,
    top: 36,
    height: 52,
    justifyContent: 'center',
  },
  linkLogin: { alignItems: 'center', marginTop: SPACING.xl },
  linkLoginText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
});

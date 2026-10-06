// src/screens/Perfil.js
// Tela Perfil / Minha conta — dados do usuário autenticado + logout +
// exclusão da conta.
//
// Nome e e-mail vêm do Firebase Authentication (auth.currentUser, via
// AuthContext). O telefone vem do documento usuarios/{uid} no Firestore.
// A troca de tela após logout/exclusão é automática (ver routes/index.js).

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../components/Header';
import ConfirmarSenhaModal from '../components/ConfirmarSenhaModal';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { usePerfil } from '../hooks/usePerfil';
import { useTreinos } from '../hooks/useTreinos';
import { mensagemErroFirebase } from '../utils/firebaseErros';
import { avisar, confirmar } from '../utils/alertas';

function formatarData(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function InfoLinha({ icon, label, valor }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>
        <Feather name={icon} size={16} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>{valor}</Text>
      </View>
    </View>
  );
}

export default function Perfil() {
  const { usuario, logout, excluirConta, processando } = useAuth();
  const { data: perfil, isLoading: carregandoPerfil } = usePerfil();
  const { data: treinos = [] } = useTreinos();

  const [saindo, setSaindo] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);

  const iniciais = (usuario?.nome || usuario?.email || '?')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const handleLogout = async () => {
    const ok = await confirmar('Sair da conta', 'Tem certeza que deseja sair do FitFlow?', 'Sair');
    if (!ok) return;
    setSaindo(true);
    try {
      await logout();
    } catch (error) {
      setSaindo(false);
      avisar('Erro', mensagemErroFirebase(error, 'Não foi possível sair. Tente novamente.'));
    }
  };

  const handleExcluirConta = async (senha) => {
    try {
      await excluirConta(senha);
      setModalExcluir(false);
      avisar('Conta excluída', 'Sua conta e seus treinos foram removidos. Até a próxima!');
    } catch (error) {
      avisar('Erro ao excluir conta', mensagemErroFirebase(error, 'Não foi possível excluir sua conta.'));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header title="Minha Conta" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
          <Text style={styles.nome}>{usuario?.nome || 'Sem nome'}</Text>
          <View style={styles.roleBadge}>
            <Feather name="award" size={12} color={COLORS.primary} />
            <Text style={styles.roleText}>
              {treinos.length} treino{treinos.length !== 1 ? 's' : ''} cadastrado{treinos.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoLinha icon="user" label="Nome" valor={usuario?.nome || '—'} />
          <View style={styles.divider} />
          <InfoLinha icon="mail" label="E-mail" valor={usuario?.email} />
          <View style={styles.divider} />
          <InfoLinha
            icon="phone"
            label="Telefone"
            valor={carregandoPerfil ? 'Carregando...' : perfil?.telefone || '—'}
          />
          <View style={styles.divider} />
          <InfoLinha icon="calendar" label="Membro desde" valor={formatarData(usuario?.criadoEm)} />
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Sobre o FitFlow</Text>
          <Text style={styles.aboutText}>
            Controle de treinos de academia: cadastre, edite e acompanhe seus treinos da semana.
            Login com Firebase Authentication e dados salvos no Cloud Firestore — cada usuário vê
            apenas os próprios treinos.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={saindo}>
          <Feather name="log-out" size={18} color={COLORS.primary} />
          <Text style={styles.logoutText}>{saindo ? 'Saindo...' : 'Sair da conta'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => setModalExcluir(true)}>
          <Feather name="trash-2" size={18} color={COLORS.critical} />
          <Text style={styles.deleteText}>Excluir minha conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmarSenhaModal
        visivel={modalExcluir}
        carregando={processando}
        onConfirmar={handleExcluirConta}
        onCancelar={() => setModalExcluir(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.md },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
  nome: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: '800' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginTop: SPACING.sm,
  },
  roleText: { color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.card,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  infoValue: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: '600', marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  aboutCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  aboutTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: '700', marginBottom: 6 },
  aboutText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, lineHeight: 20 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  logoutText: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.critical + '12',
  },
  deleteText: { color: COLORS.critical, fontSize: FONTS.sizes.md, fontWeight: '700' },
});

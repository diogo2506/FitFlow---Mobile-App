// src/screens/Home.js
// Tela Início (Dashboard) — visão consolidada dos treinos do usuário logado,
// calculada a partir dos dados carregados do Firestore.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../components/Header';
import StatCard from '../components/StatCard';
import TreinoCard from '../components/TreinoCard';
import EmptyState from '../components/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { DIA_POR_VALOR, diaDeHoje } from '../constants/treinos';
import { useAuth } from '../contexts/AuthContext';
import { useTreinos } from '../hooks/useTreinos';
import { mensagemErroFirebase } from '../utils/firebaseErros';

export default function Home({ navigation }) {
  const { usuario } = useAuth();
  const { data: treinos = [], isLoading, isFetching, isError, error, refetch } = useTreinos();
  const hoje = diaDeHoje();

  const resumo = useMemo(() => {
    const concluidos = treinos.filter((t) => t.concluido).length;
    const minutos = treinos.reduce((soma, t) => soma + (Number(t.duracaoMin) || 0), 0);
    const progresso = treinos.length ? Math.round((concluidos / treinos.length) * 100) : 0;
    const deHoje = treinos.filter((t) => t.diaSemana === hoje);
    return { concluidos, minutos, progresso, deHoje };
  }, [treinos, hoje]);

  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'atleta';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header title="FitFlow" />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={COLORS.primary} />
        }
      >
        <Text style={styles.saudacao}>Olá, {primeiroNome} 👋</Text>
        <Text style={styles.subtitulo}>Bora treinar? Hoje é {DIA_POR_VALOR[hoje]?.nome.toLowerCase()}.</Text>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          <StatCard icon="list" label="Treinos" value={isLoading ? '—' : treinos.length} color={COLORS.primary} />
          <StatCard icon="check-circle" label="Concluídos" value={isLoading ? '—' : resumo.concluidos} color={COLORS.success} />
          <StatCard icon="clock" label="Min/semana" value={isLoading ? '—' : resumo.minutos} color={COLORS.secondary} />
        </View>

        {/* Progresso da semana */}
        <View style={styles.progressoCard}>
          <View style={styles.progressoTopo}>
            <Text style={styles.progressoTitulo}>Progresso da semana</Text>
            <Text style={styles.progressoValor}>{resumo.progresso}%</Text>
          </View>
          <View style={styles.progressoTrilho}>
            <View style={[styles.progressoBarra, { width: `${resumo.progresso}%` }]} />
          </View>
        </View>

        {/* Ações rápidas */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('TreinoForm')}>
            <Feather name="plus-circle" size={20} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Novo treino</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Semana')}>
            <Feather name="calendar" size={20} color={COLORS.secondary} />
            <Text style={styles.quickActionText}>Ver semana</Text>
          </TouchableOpacity>
        </View>

        {/* Treinos de hoje */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Treinos de hoje</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MeusTreinos')}>
            <Text style={styles.sectionLink}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>Carregando treinos...</Text>
        ) : isError ? (
          <EmptyState
            icon="wifi-off"
            title={mensagemErroFirebase(error, 'Não foi possível carregar seus treinos.')}
            actionLabel="Tentar novamente"
            onAction={refetch}
          />
        ) : resumo.deHoje.length === 0 ? (
          <EmptyState
            icon="coffee"
            title="Nenhum treino para hoje. Dia de descanso ou hora de cadastrar um!"
          />
        ) : (
          resumo.deHoje.map((treino) => (
            <TreinoCard
              key={treino.id}
              treino={treino}
              compacto
              onPress={() => navigation.navigate('TreinoForm', { treinoId: treino.id })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  saudacao: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
  subtitulo: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: 2, marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  progressoCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressoTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressoTitulo: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  progressoValor: { color: COLORS.white, fontSize: FONTS.sizes.xl, fontWeight: '800' },
  progressoTrilho: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressoBarra: { height: '100%', borderRadius: 5, backgroundColor: COLORS.secondary },
  quickActions: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  quickActionText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.sm, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  sectionLink: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
});

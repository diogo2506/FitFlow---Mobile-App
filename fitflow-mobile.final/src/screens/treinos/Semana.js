// src/screens/treinos/Semana.js
// Tela "Semana" — os mesmos treinos do Firestore, agrupados por dia da semana
// (segunda a domingo), com o dia de hoje em destaque. Evolução da antiga
// aba "Lembretes" do VetFlow.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import TreinoCard from '../../components/TreinoCard';
import EmptyState from '../../components/EmptyState';
import LoadingOverlay from '../../components/LoadingOverlay';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { DIAS_SEMANA, diaDeHoje } from '../../constants/treinos';
import { useTreinos } from '../../hooks/useTreinos';
import { mensagemErroFirebase } from '../../utils/firebaseErros';

export default function Semana({ navigation }) {
  const { data: treinos = [], isLoading, isFetching, isError, error, refetch } = useTreinos();
  const hoje = diaDeHoje();

  const secoes = useMemo(
    () =>
      DIAS_SEMANA.map((dia) => {
        const doDia = treinos.filter((t) => t.diaSemana === dia.value);
        return {
          dia,
          data: doDia,
          minutos: doDia.reduce((soma, t) => soma + (Number(t.duracaoMin) || 0), 0),
        };
      }).filter((s) => s.data.length > 0 || s.dia.value === hoje),
    [treinos, hoje],
  );

  if (isLoading) return <LoadingOverlay mensagem="Montando sua semana..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header title="Minha Semana" />

      <SectionList
        sections={treinos.length === 0 || isError ? [] : secoes}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={COLORS.primary} />
        }
        renderSectionHeader={({ section }) => {
          const ehHoje = section.dia.value === hoje;
          return (
            <View style={styles.secaoHeader}>
              <View style={[styles.diaBadge, ehHoje && styles.diaBadgeHoje]}>
                <Text style={[styles.diaBadgeText, ehHoje && styles.diaBadgeTextHoje]}>{section.dia.label}</Text>
              </View>
              <Text style={styles.secaoTitulo}>
                {section.dia.nome}
                {ehHoje ? ' · hoje' : ''}
              </Text>
              {section.minutos > 0 && <Text style={styles.secaoMinutos}>{section.minutos} min</Text>}
            </View>
          );
        }}
        renderItem={({ item }) => (
          <TreinoCard
            treino={item}
            compacto
            onPress={() => navigation.navigate('TreinoForm', { treinoId: item.id })}
          />
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <TouchableOpacity
              style={styles.descanso}
              onPress={() => navigation.navigate('TreinoForm')}
            >
              <Feather name="coffee" size={14} color={COLORS.textMuted} />
              <Text style={styles.descansoText}>Nenhum treino hoje. Toque para adicionar.</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          isError ? (
            <EmptyState
              icon="wifi-off"
              title={mensagemErroFirebase(error, 'Não foi possível carregar seus treinos.')}
              actionLabel="Tentar novamente"
              onAction={refetch}
            />
          ) : (
            <EmptyState
              icon="calendar"
              title="Nenhum treino encontrado. Cadastre treinos para montar sua semana."
              actionLabel="Cadastrar treino"
              onAction={() => navigation.navigate('TreinoForm')}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl, flexGrow: 1 },
  secaoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  diaBadge: {
    width: 40,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaBadgeHoje: { backgroundColor: COLORS.secondary },
  diaBadgeText: { color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '800' },
  diaBadgeTextHoje: { color: COLORS.white },
  secaoTitulo: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: '700' },
  secaoMinutos: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600' },
  descanso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  descansoText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
});

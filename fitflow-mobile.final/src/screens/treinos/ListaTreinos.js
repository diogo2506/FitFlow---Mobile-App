// src/screens/treinos/ListaTreinos.js
// Tela de Listagem — READ do CRUD de Treinos (dados carregados do Firestore),
// com busca, filtro por status e as ações de concluir, editar e excluir.

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import TreinoCard from '../../components/TreinoCard';
import EmptyState from '../../components/EmptyState';
import LoadingOverlay from '../../components/LoadingOverlay';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { GRUPO_POR_VALOR } from '../../constants/treinos';
import { useTreinos, useDeleteTreino, useUpdateTreino } from '../../hooks/useTreinos';
import { mensagemErroFirebase } from '../../utils/firebaseErros';
import { avisar, confirmar } from '../../utils/alertas';

const FILTROS = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDENTES', label: 'Pendentes' },
  { value: 'CONCLUIDOS', label: 'Concluídos' },
];

export default function ListaTreinos({ navigation }) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('TODOS');
  const [alternandoId, setAlternandoId] = useState(null);

  const { data: treinos = [], isLoading, isFetching, isError, error, refetch } = useTreinos();
  const deleteTreino = useDeleteTreino();
  const updateTreino = useUpdateTreino();

  const treinosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return treinos.filter((t) => {
      if (filtro === 'PENDENTES' && t.concluido) return false;
      if (filtro === 'CONCLUIDOS' && !t.concluido) return false;
      if (!termo) return true;
      const grupo = GRUPO_POR_VALOR[t.grupoMuscular]?.label || '';
      return (
        (t.nome || '').toLowerCase().includes(termo) ||
        (t.exercicios || '').toLowerCase().includes(termo) ||
        grupo.toLowerCase().includes(termo)
      );
    });
  }, [treinos, busca, filtro]);

  const handleExcluir = async (treino) => {
    const ok = await confirmar(
      'Excluir treino',
      `Tem certeza que deseja excluir o treino "${treino.nome}"?`,
      'Excluir',
    );
    if (!ok) return;
    deleteTreino.mutate(treino.id, {
      onSuccess: () => avisar('Treino excluído', `"${treino.nome}" foi removido com sucesso.`),
      onError: (e) => avisar('Erro', mensagemErroFirebase(e, 'Não foi possível excluir o treino.')),
    });
  };

  const handleAlternarConcluido = (treino) => {
    setAlternandoId(treino.id);
    updateTreino.mutate(
      { id: treino.id, dados: { concluido: !treino.concluido } },
      {
        onError: (e) => avisar('Erro', mensagemErroFirebase(e, 'Não foi possível atualizar o treino.')),
        onSettled: () => setAlternandoId(null),
      },
    );
  };

  const abrirEdicao = (treino) => navigation.navigate('TreinoForm', { treinoId: treino.id });

  if (isLoading) return <LoadingOverlay mensagem="Carregando seus treinos..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Header
        title="Meus Treinos"
        rightIcon="plus-circle"
        onRightPress={() => navigation.navigate('TreinoForm')}
      />

      <View style={styles.searchWrapper}>
        <Feather name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, exercício ou grupo..."
          placeholderTextColor={COLORS.textMuted}
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Feather name="x-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtrosRow}>
        {FILTROS.map((f) => {
          const ativo = filtro === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.filtroChip, ativo && styles.filtroChipAtivo]}
              onPress={() => setFiltro(f.value)}
            >
              <Text style={[styles.filtroText, ativo && styles.filtroTextAtivo]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ flex: 1 }} />
        <Text style={styles.countText}>
          {treinosFiltrados.length} treino{treinosFiltrados.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={treinosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TreinoCard
            treino={item}
            onPress={() => abrirEdicao(item)}
            onEditar={() => abrirEdicao(item)}
            onExcluir={() => handleExcluir(item)}
            onAlternarConcluido={() => handleAlternarConcluido(item)}
            alternando={alternandoId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          isError ? (
            <EmptyState
              icon="wifi-off"
              title={mensagemErroFirebase(error, 'Não foi possível carregar seus treinos.')}
              actionLabel="Tentar novamente"
              onAction={refetch}
            />
          ) : treinos.length === 0 ? (
            <EmptyState
              icon="activity"
              title="Nenhum treino encontrado. Cadastre o seu primeiro treino!"
              actionLabel="Cadastrar treino"
              onAction={() => navigation.navigate('TreinoForm')}
            />
          ) : (
            <EmptyState icon="search" title="Nenhum treino encontrado para este filtro." />
          )
        }
      />

      {deleteTreino.isPending && (
        <View style={styles.processandoBar}>
          <Text style={styles.processandoText}>Excluindo treino...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    height: 48,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sizes.md, height: '100%' },
  filtrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  filtroChip: {
    paddingHorizontal: SPACING.md,
    height: 32,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
  },
  filtroChipAtivo: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filtroText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  filtroTextAtivo: { color: COLORS.white },
  countText: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, flexGrow: 1 },
  processandoBar: {
    position: 'absolute',
    bottom: SPACING.lg,
    alignSelf: 'center',
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  processandoText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },
});

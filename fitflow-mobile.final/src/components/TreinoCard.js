// src/components/TreinoCard.js
// Card de um treino na listagem: informações principais + ações de
// concluir, editar e excluir (exigências do CP5 para a tela de listagem).

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../constants/theme';
import { GRUPO_POR_VALOR, DIA_POR_VALOR, INTENSIDADE_POR_VALOR } from '../constants/treinos';

export default function TreinoCard({
  treino,
  onPress,
  onEditar,
  onExcluir,
  onAlternarConcluido,
  alternando = false,
  compacto = false,
}) {
  const grupo = GRUPO_POR_VALOR[treino.grupoMuscular]?.label || treino.grupoMuscular;
  const dia = DIA_POR_VALOR[treino.diaSemana]?.nome || treino.diaSemana;
  const intensidade = INTENSIDADE_POR_VALOR[treino.intensidade];
  const corBarra = intensidade?.color || COLORS.primary;

  return (
    <TouchableOpacity
      style={[styles.card, treino.concluido && styles.cardConcluido]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View style={[styles.bar, { backgroundColor: corBarra }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.nome, treino.concluido && styles.nomeConcluido]} numberOfLines={1}>
              {treino.nome}
            </Text>
            <Text style={styles.subtitulo} numberOfLines={1}>
              {grupo} · {dia}
            </Text>
          </View>

          {onAlternarConcluido && (
            <TouchableOpacity
              style={[styles.checkBtn, treino.concluido && styles.checkBtnAtivo]}
              onPress={onAlternarConcluido}
              disabled={alternando}
              hitSlop={8}
            >
              {alternando ? (
                <ActivityIndicator size="small" color={treino.concluido ? COLORS.white : COLORS.success} />
              ) : (
                <Feather name="check" size={16} color={treino.concluido ? COLORS.white : COLORS.textMuted} />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={12} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{treino.duracaoMin} min</Text>
          </View>
          {!!treino.calorias && (
            <View style={styles.metaItem}>
              <Feather name="zap" size={12} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{treino.calorias} kcal</Text>
            </View>
          )}
          {intensidade && (
            <View style={[styles.badge, { backgroundColor: intensidade.color + '22' }]}>
              <View style={[styles.badgeDot, { backgroundColor: intensidade.color }]} />
              <Text style={[styles.badgeText, { color: intensidade.color }]}>{intensidade.label}</Text>
            </View>
          )}
        </View>

        {!compacto && !!treino.exercicios && (
          <Text style={styles.exercicios} numberOfLines={2}>
            {treino.exercicios}
          </Text>
        )}

        {(onEditar || onExcluir) && (
          <View style={styles.acoes}>
            {treino.concluido && (
              <View style={styles.statusConcluido}>
                <Feather name="check-circle" size={12} color={COLORS.success} />
                <Text style={styles.statusConcluidoText}>Concluído</Text>
              </View>
            )}
            <View style={{ flex: 1 }} />
            {onEditar && (
              <TouchableOpacity style={styles.acaoBtn} onPress={onEditar} hitSlop={6}>
                <Feather name="edit-2" size={14} color={COLORS.primary} />
                <Text style={[styles.acaoText, { color: COLORS.primary }]}>Editar</Text>
              </TouchableOpacity>
            )}
            {onExcluir && (
              <TouchableOpacity style={styles.acaoBtn} onPress={onExcluir} hitSlop={6}>
                <Feather name="trash-2" size={14} color={COLORS.critical} />
                <Text style={[styles.acaoText, { color: COLORS.critical }]}>Excluir</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  cardConcluido: { opacity: 0.85 },
  bar: { width: 4 },
  content: { flex: 1, padding: SPACING.md },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  nome: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  nomeConcluido: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  subtitulo: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnAtivo: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  exercicios: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statusConcluido: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusConcluidoText: { color: COLORS.success, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  acaoBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  acaoText: { fontSize: FONTS.sizes.sm, fontWeight: '700' },
});

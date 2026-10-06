// src/components/ChipSelector.js
// Seletor de opção única em formato de "chips" (grupo muscular, dia da
// semana, intensidade). Mesmo padrão visual dos chips de espécie do VetFlow,
// agora extraído para um componente reutilizável.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function ChipSelector({ label, opcoes, valor, onChange, error, compacto = false }) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {opcoes.map((opcao) => {
          const ativo = valor === opcao.value;
          const cor = opcao.color || COLORS.primary;
          return (
            <TouchableOpacity
              key={opcao.value}
              style={[
                styles.chip,
                compacto && styles.chipCompacto,
                error && !valor && styles.chipErro,
                ativo && { backgroundColor: cor, borderColor: cor },
              ]}
              onPress={() => onChange(opcao.value)}
              activeOpacity={0.85}
            >
              <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>{opcao.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.lg },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    height: 38,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCompacto: {
    minWidth: 42,
    paddingHorizontal: SPACING.sm,
  },
  chipErro: { borderColor: COLORS.critical },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  chipTextAtivo: { color: COLORS.white },
  errorText: {
    color: COLORS.critical,
    fontSize: FONTS.sizes.xs,
    marginTop: 4,
  },
});

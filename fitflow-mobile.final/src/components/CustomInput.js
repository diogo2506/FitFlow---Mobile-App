// src/components/CustomInput.js
// Campo de input padronizado com o tema do FitFlow.

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function CustomInput({ label, icon, error, style, multiline, ...props }) {
  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, multiline && styles.inputMultiline, error && styles.inputError]}>
        {icon && (
          <Feather
            name={icon}
            size={18}
            color={COLORS.textSecondary}
            style={[styles.icon, multiline && styles.iconMultiline]}
          />
        )}
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={COLORS.textMuted}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    height: 52,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 110,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.critical,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  iconMultiline: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    height: '100%',
  },
  textArea: {
    height: undefined,
    minHeight: 86,
  },
  errorText: {
    color: COLORS.critical,
    fontSize: FONTS.sizes.xs,
    marginTop: 4,
  },
});

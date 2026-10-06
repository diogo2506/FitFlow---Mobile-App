// src/components/ConfirmarSenhaModal.js
// Modal que pede a senha atual antes de excluir a conta.
// O Firebase exige um login recente para deleteUser(); com a senha fazemos
// a reautenticação. A senha fica só no estado do componente (memória) e é
// descartada ao fechar — nunca é salva.

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

import CustomInput from './CustomInput';
import PrimaryButton from './PrimaryButton';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function ConfirmarSenhaModal({ visivel, carregando, onConfirmar, onCancelar }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!visivel) {
      setSenha('');
      setErro(null);
    }
  }, [visivel]);

  const handleConfirmar = () => {
    if (!senha) {
      setErro('Informe sua senha para confirmar.');
      return;
    }
    onConfirmar(senha);
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <Feather name="alert-triangle" size={26} color={COLORS.critical} />
          </View>
          <Text style={styles.titulo}>Excluir conta</Text>
          <Text style={styles.texto}>
            Esta ação é permanente: sua conta e todos os seus treinos serão apagados.
            Digite sua senha para confirmar.
          </Text>

          <CustomInput
            label="Senha atual"
            icon="lock"
            placeholder="••••••••"
            secureTextEntry
            value={senha}
            onChangeText={(t) => { setSenha(t); setErro(null); }}
            error={erro}
            autoFocus
          />

          <PrimaryButton
            label="EXCLUIR DEFINITIVAMENTE"
            icon="trash-2"
            variant="danger"
            onPress={handleConfirmar}
            loading={carregando}
          />
          <PrimaryButton
            label="Cancelar"
            variant="outline"
            onPress={onCancelar}
            disabled={carregando}
            style={{ marginTop: SPACING.sm }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.critical + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  titulo: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  texto: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
});

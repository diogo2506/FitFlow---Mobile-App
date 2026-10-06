// src/utils/alertas.js
// Alertas e confirmações que funcionam tanto no celular (Alert nativo) quanto
// no Expo Web (onde Alert.alert não suporta botões).

import { Alert, Platform } from 'react-native';

/** Mensagem simples de sucesso/erro. */
export function avisar(titulo, mensagem) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }
  Alert.alert(titulo, mensagem, [{ text: 'OK' }]);
}

/**
 * Pede confirmação ao usuário. Retorna uma Promise<boolean>.
 * Ex.: if (await confirmar('Excluir', 'Tem certeza?', 'Excluir')) { ... }
 */
export function confirmar(titulo, mensagem, textoConfirmar = 'Confirmar') {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensagem}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: textoConfirmar, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

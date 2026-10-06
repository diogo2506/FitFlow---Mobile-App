// src/utils/firebaseErros.js
// Traduz os códigos de erro do Firebase para mensagens amigáveis em português.

const MENSAGENS = {
  // Authentication
  'auth/invalid-email': 'E-mail inválido.',
  'auth/missing-email': 'Informe o e-mail.',
  'auth/user-not-found': 'Não existe conta com este e-mail.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-login-credentials': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Já existe uma conta cadastrada com este e-mail.',
  'auth/weak-password': 'A senha deve ter no mínimo 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Sem conexão com a internet. Verifique sua rede.',
  'auth/requires-recent-login': 'Por segurança, faça login novamente para concluir esta ação.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/invalid-api-key': 'Firebase não configurado. Confira src/config/firebaseConfig.js.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    'Firebase não configurado. Confira src/config/firebaseConfig.js.',

  // Firestore
  'permission-denied': 'Você não tem permissão para acessar estes dados.',
  unavailable: 'Serviço indisponível no momento. Verifique sua conexão.',
  'not-found': 'Registro não encontrado.',
  'deadline-exceeded': 'A operação demorou demais. Tente novamente.',
};

export function mensagemErroFirebase(error, padrao = 'Ocorreu um erro inesperado. Tente novamente.') {
  const codigo = error?.code;
  if (codigo && MENSAGENS[codigo]) return MENSAGENS[codigo];
  if (__DEV__) console.warn('[Firebase]', codigo, error?.message);
  return padrao;
}

export default mensagemErroFirebase;

// src/services/authService.js
// Autenticação com Firebase Authentication.
//
// Nenhuma tela chama o SDK do Firebase diretamente: tudo passa por aqui
// (ou pelos demais services), mantendo a mesma separação em camadas do
// VetFlow (UI → contexts/hooks → services).
//
// Operações: cadastro, login, logout, recuperação de senha e exclusão da conta.
// A senha só trafega para o Firebase Auth — nunca é gravada no Firestore nem
// no AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { usuariosService } from './usuariosService';
import { treinosService } from './treinosService';

export const STORAGE_KEYS = {
  // Apenas um cache do perfil (uid, nome, e-mail) para exibição rápida.
  // NUNCA contém senha. O token de sessão é gerenciado pelo próprio Firebase
  // Auth (getReactNativePersistence + AsyncStorage) — ver config/firebase.js.
  USER: '@fitflow:usuario',
};

export const authService = {
  /** Login com e-mail e senha. */
  login: async ({ email, senha }) => {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    return credencial.user;
  },

  /**
   * Cadastro: cria o usuário no Auth, grava o nome no perfil do Auth
   * (displayName) e cria o documento usuarios/{uid} no Firestore.
   */
  registrar: async ({ nome, email, telefone, senha }) => {
    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    await updateProfile(credencial.user, { displayName: nome });
    await usuariosService.criarPerfil(credencial.user.uid, { nome, email, telefone });
    return credencial.user;
  },

  /** Envia o e-mail de redefinição de senha do Firebase. */
  recuperarSenha: (email) => sendPasswordResetEmail(auth, email),

  /** Encerra a sessão (o Firebase limpa o token persistido). */
  logout: () => signOut(auth),

  /**
   * Exclui a conta do usuário logado.
   * O Firebase exige login recente para excluir a conta, por isso pedimos a
   * senha novamente e reautenticamos antes. Depois apagamos os dados do
   * usuário no Firestore (treinos + documento de perfil) e, por fim, a conta.
   */
  excluirConta: async (senhaAtual) => {
    const usuario = auth.currentUser;
    if (!usuario) throw new Error('Nenhum usuário autenticado.');

    const credencial = EmailAuthProvider.credential(usuario.email, senhaAtual);
    await reauthenticateWithCredential(usuario, credencial);

    await treinosService.deletarTodos(usuario.uid);
    await usuariosService.excluirPerfil(usuario.uid);
    await deleteUser(usuario);
  },
};

// ─────────────────────────────────────────────────
// CACHE LOCAL DO PERFIL (AsyncStorage) — não é a sessão em si
// ─────────────────────────────────────────────────
export async function salvarUsuarioCache(usuario) {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(usuario));
}

export async function limparUsuarioCache() {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

export async function getUsuarioCache() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

/** Converte o User do Firebase para o formato usado no app. */
export function mapFirebaseUser(user, nomeFallback) {
  if (!user) return null;
  return {
    uid: user.uid,
    nome: user.displayName || nomeFallback || '',
    email: user.email,
    criadoEm: user.metadata?.creationTime || null,
  };
}

export default authService;

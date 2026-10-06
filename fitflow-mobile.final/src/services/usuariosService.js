// src/services/usuariosService.js
// Documento de perfil do usuário no Cloud Firestore: usuarios/{uid}
//
// Guarda apenas dados de cadastro (nome, e-mail, telefone) — NUNCA a senha.
// É também o "pai" da subcoleção usuarios/{uid}/treinos.

import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const COLECAO_USUARIOS = 'usuarios';

export const usuarioRef = (uid) => doc(db, COLECAO_USUARIOS, uid);

export const usuariosService = {
  /** Cria (ou sobrescreve) o perfil no cadastro. */
  criarPerfil: (uid, { nome, email, telefone }) =>
    setDoc(usuarioRef(uid), {
      nome,
      email,
      telefone: telefone || null,
      criadoEm: serverTimestamp(),
    }),

  /** Lê o perfil do usuário logado. */
  buscarPerfil: async (uid) => {
    const snapshot = await getDoc(usuarioRef(uid));
    if (!snapshot.exists()) return null;
    const dados = snapshot.data();
    return {
      id: snapshot.id,
      ...dados,
      criadoEm: dados.criadoEm?.toMillis?.() ?? null,
    };
  },

  /** Remove o documento de perfil (usado na exclusão da conta). */
  excluirPerfil: (uid) => deleteDoc(usuarioRef(uid)),
};

export default usuariosService;

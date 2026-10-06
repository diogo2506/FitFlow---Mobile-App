// src/services/treinosService.js
// CRUD de Treinos no Cloud Firestore.
//
// Estrutura (subcoleção por usuário, como trabalhado em aula):
//
//   usuarios
//    └── {uid}
//         └── treinos
//              ├── {treinoId}
//              └── ...
//
// Como o caminho sempre parte do uid do usuário autenticado, cada usuário só
// enxerga os próprios treinos. As regras do Firestore (firestore.rules)
// garantem isso também no servidor.
//
// Modelo de um treino:
// { id, nome, grupoMuscular, diaSemana, duracaoMin, exercicios, calorias,
//   intensidade ('LEVE'|'MODERADA'|'INTENSA'), concluido, usuarioId,
//   criadoEm, atualizadoEm }

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { COLECAO_USUARIOS } from './usuariosService';

export const SUBCOLECAO_TREINOS = 'treinos';

const treinosRef = (uid) => collection(db, COLECAO_USUARIOS, uid, SUBCOLECAO_TREINOS);
const treinoRef = (uid, id) => doc(db, COLECAO_USUARIOS, uid, SUBCOLECAO_TREINOS, id);

/** Converte um DocumentSnapshot em objeto simples (Timestamps → millis). */
function mapTreino(snapshot) {
  const dados = snapshot.data();
  return {
    id: snapshot.id,
    ...dados,
    criadoEm: dados.criadoEm?.toMillis?.() ?? null,
    atualizadoEm: dados.atualizadoEm?.toMillis?.() ?? null,
  };
}

export const treinosService = {
  /** READ — lista todos os treinos do usuário (mais recentes primeiro). */
  listar: async (uid) => {
    const consulta = query(treinosRef(uid), orderBy('criadoEm', 'desc'));
    const snapshot = await getDocs(consulta);
    return snapshot.docs.map(mapTreino);
  },

  /** READ — busca um treino específico (tela de edição). */
  buscarPorId: async (uid, id) => {
    const snapshot = await getDoc(treinoRef(uid, id));
    if (!snapshot.exists()) throw new Error('Treino não encontrado.');
    return mapTreino(snapshot);
  },

  /** CREATE */
  criar: async (uid, dados) => {
    const ref = await addDoc(treinosRef(uid), {
      ...dados,
      usuarioId: uid,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    return ref.id;
  },

  /** UPDATE */
  atualizar: (uid, id, dados) =>
    updateDoc(treinoRef(uid, id), {
      ...dados,
      atualizadoEm: serverTimestamp(),
    }),

  /** DELETE */
  deletar: (uid, id) => deleteDoc(treinoRef(uid, id)),

  /** Remove todos os treinos do usuário (usado ao excluir a conta). */
  deletarTodos: async (uid) => {
    const snapshot = await getDocs(treinosRef(uid));
    if (snapshot.empty) return;
    const lote = writeBatch(db);
    snapshot.docs.forEach((d) => lote.delete(d.ref));
    await lote.commit();
  },
};

export default treinosService;

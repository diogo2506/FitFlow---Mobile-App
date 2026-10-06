// src/hooks/useTreinos.js
// Hooks do TanStack Query para o CRUD de Treinos no Firestore.
//
// Todos os hooks pegam o uid do usuário AUTENTICADO direto do AuthContext —
// a tela nunca informa "de quem" é o treino, então não há como ler ou gravar
// treinos de outro usuário pelo app. Após cada mutation, a lista é
// invalidada e recarregada do Firestore (interface sempre atualizada).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treinosService } from '../services/treinosService';
import { useAuth } from '../contexts/AuthContext';

const treinosKey = (uid) => ['treinos', uid];
const treinoKey = (uid, id) => ['treino', uid, id];

/** READ — lista os treinos do usuário logado. */
export function useTreinos() {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  return useQuery({
    queryKey: treinosKey(uid),
    queryFn: () => treinosService.listar(uid),
    enabled: !!uid,
  });
}

/** READ — busca um treino específico (tela de edição). */
export function useTreino(id) {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  return useQuery({
    queryKey: treinoKey(uid, id),
    queryFn: () => treinosService.buscarPorId(uid, id),
    enabled: !!uid && !!id,
  });
}

/** CREATE */
export function useCreateTreino() {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  return useMutation({
    mutationFn: (dados) => treinosService.criar(uid, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: treinosKey(uid) }),
  });
}

/** UPDATE — também usado para marcar/desmarcar "concluído" na lista. */
export function useUpdateTreino() {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  return useMutation({
    mutationFn: ({ id, dados }) => treinosService.atualizar(uid, id, dados),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: treinosKey(uid) });
      queryClient.invalidateQueries({ queryKey: treinoKey(uid, variables.id) });
    },
  });
}

/** DELETE */
export function useDeleteTreino() {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  return useMutation({
    mutationFn: (id) => treinosService.deletar(uid, id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: treinoKey(uid, id) });
      queryClient.invalidateQueries({ queryKey: treinosKey(uid) });
    },
  });
}

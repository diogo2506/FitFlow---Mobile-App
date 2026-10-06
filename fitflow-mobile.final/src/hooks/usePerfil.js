// src/hooks/usePerfil.js
// Lê o documento usuarios/{uid} do Firestore (dados extras do cadastro,
// como o telefone). Nome e e-mail vêm do Firebase Authentication.

import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';
import { useAuth } from '../contexts/AuthContext';

export function usePerfil() {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  return useQuery({
    queryKey: ['perfil', uid],
    queryFn: () => usuariosService.buscarPerfil(uid),
    enabled: !!uid,
  });
}

export default usePerfil;

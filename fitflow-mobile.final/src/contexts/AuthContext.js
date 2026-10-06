// src/contexts/AuthContext.js
// Contexto global de autenticação (Firebase Authentication).
//
// Responsável por:
//  - Restaurar a sessão ao abrir o app: o Firebase Auth foi inicializado com
//    persistência no AsyncStorage (ver config/firebase.js), então o
//    onAuthStateChanged devolve o usuário logado assim que o app abre — sem
//    pedir login de novo.
//  - Expor login / registrar / logout / recuperarSenha / excluirConta.
//  - Servir de "porteiro" da navegação: enquanto `isAuthenticated` for
//    false, só as telas de Login/Cadastro/Esqueci a senha existem na árvore
//    de navegação (ver src/routes/index.js) — proteção de rotas real.

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../config/firebase';
import { queryClient } from '../services/queryClient';
import {
  authService,
  mapFirebaseUser,
  salvarUsuarioCache,
  limparUsuarioCache,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [processando, setProcessando] = useState(false);

  // No cadastro, o onAuthStateChanged dispara ANTES do updateProfile gravar
  // o nome. Guardamos o nome digitado aqui para não exibir um usuário "sem nome".
  const nomePendente = useRef(null);

  // Observa a sessão do Firebase (login, logout, restauração no boot).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const perfil = mapFirebaseUser(user, nomePendente.current);
        setUsuario(perfil);
        await salvarUsuarioCache(perfil);
      } else {
        setUsuario(null);
        await limparUsuarioCache();
        queryClient.clear(); // nenhum dado do usuário anterior fica em memória
      }
      setCarregandoSessao(false);
    });
    return unsubscribe;
  }, []);

  /** Envolve uma ação com o estado `processando` (loading dos botões). */
  const executar = useCallback(async (acao) => {
    setProcessando(true);
    try {
      return await acao();
    } finally {
      setProcessando(false);
    }
  }, []);

  const login = useCallback(
    ({ email, senha }) => executar(() => authService.login({ email, senha })),
    [executar],
  );

  const registrar = useCallback(
    ({ nome, email, telefone, senha }) =>
      executar(async () => {
        nomePendente.current = nome;
        try {
          const user = await authService.registrar({ nome, email, telefone, senha });
          const perfil = mapFirebaseUser(user, nome);
          setUsuario(perfil);
          await salvarUsuarioCache(perfil);
          return perfil;
        } finally {
          nomePendente.current = null;
        }
      }),
    [executar],
  );

  const recuperarSenha = useCallback(
    (email) => executar(() => authService.recuperarSenha(email)),
    [executar],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    // O onAuthStateChanged recebe null e limpa estado, cache e queries.
  }, []);

  const excluirConta = useCallback(
    (senhaAtual) => executar(() => authService.excluirConta(senhaAtual)),
    [executar],
  );

  const value = useMemo(
    () => ({
      usuario, // { uid, nome, email, criadoEm }
      isAuthenticated: !!usuario,
      carregandoSessao,
      processando,
      login,
      registrar,
      recuperarSenha,
      logout,
      excluirConta,
    }),
    [usuario, carregandoSessao, processando, login, registrar, recuperarSenha, logout, excluirConta],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}

export default AuthContext;

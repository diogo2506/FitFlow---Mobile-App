// src/config/firebase.js
// Inicialização única do Firebase (App, Authentication e Cloud Firestore).
//
// PERSISTÊNCIA DA SESSÃO: no mobile, o Firebase Auth é inicializado com
// getReactNativePersistence(AsyncStorage). Assim o próprio SDK guarda o token
// de sessão no AsyncStorage e restaura o usuário logado quando o app é
// reaberto — a senha NUNCA é salva (nem no AsyncStorage, nem no Firestore).
// No Expo Web usamos o getAuth padrão (persistência do navegador).

import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { firebaseConfig } from './firebaseConfig';

// Evita "Firebase App named '[DEFAULT]' already exists" no hot reload.
const jaInicializado = getApps().length > 0;
const app = jaInicializado ? getApp() : initializeApp(firebaseConfig);

function criarAuth() {
  if (Platform.OS === 'web') return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Já inicializado (hot reload) — reaproveita a instância existente.
    return getAuth(app);
  }
}

function criarFirestore() {
  if (jaInicializado) return getFirestore(app);
  // Long polling deixa a conexão do Firestore estável no React Native/Expo Go.
  return initializeFirestore(app, {
    experimentalForceLongPolling: Platform.OS !== 'web',
  });
}

export const auth = criarAuth();
export const db = criarFirestore();

export default app;

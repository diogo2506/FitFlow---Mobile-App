// src/config/firebaseConfig.js
// Credenciais do projeto Firebase "FitFlow" (fitflow-96b7e).
//
// IMPORTANTE: este arquivo é o ÚNICO lugar que precisa ser alterado para
// conectar o app ao projeto Firebase (mesma ideia do antigo env.js do
// VetFlow, que guardava a URL da API).
//
// Onde encontrar: Console do Firebase → Configurações do projeto (engrenagem)
// → Geral → "Seus apps" → app Web (</>) → "Configuração do SDK".
//
// Obs.: a configuração Web do Firebase NÃO é secreta — quem protege os dados
// são as regras do Firestore (ver firestore.rules na raiz do projeto).

export const firebaseConfig = {
  apiKey: 'AIzaSyAs_L6S62-g8VigAMObQl0XeNAsCquhFLk',
  authDomain: 'fitflow-96b7e.firebaseapp.com',
  projectId: 'fitflow-96b7e',
  storageBucket: 'fitflow-96b7e.firebasestorage.app',
  messagingSenderId: '440313734843',
  appId: '1:440313734843:web:f136f1c34913fba1702b9e',
  measurementId: 'G-VZCHME7ZYK', // opcional (Analytics não é usado no app)
};

/** true quando as credenciais acima já foram preenchidas. */
export const firebaseConfigurado = !firebaseConfig.apiKey.startsWith('COLE_AQUI');

export default firebaseConfig;
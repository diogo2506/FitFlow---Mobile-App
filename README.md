# FitFlow — Controle de Treinos (CheckPoint 5)

Aplicativo mobile em **React Native + Expo** para organizar treinos de academia, com **Firebase Authentication** (cadastro, login, sessão persistente, logout, recuperação de senha e exclusão de conta) e **Cloud Firestore** (CRUD completo de treinos, isolado por usuário).

Disciplina **Mobile Application Development** — 2TDS — Prof. Fernando Pinéo.

## Integrantes

| Nome | RM |
| Diogo Cunha Abrão de Oliveira | RM 563654 |

## Tema do aplicativo

**Academia — controle de treinos.** Cada usuário cadastra os treinos da sua semana (nome, exercícios, duração, calorias, grupo muscular, dia da semana, intensidade e status de concluído), acompanha o progresso e consulta a agenda semanal.

## Descrição do projeto

O FitFlow é a evolução do projeto anterior do grupo (VetFlow). Mantivemos a mesma arquitetura em camadas e os mesmos padrões de código — `contexts` → `hooks` (TanStack Query) → `services` — e trocamos a fonte de dados: a API HTTP deu lugar ao **Firebase Authentication** e ao **Cloud Firestore**.

## Link do vídeo demonstrativo: "https://youtu.be/5oWpEz3akQA"

Principais funcionalidades:

- **Autenticação (Firebase Auth):** cadastro, login, logout, "esqueci minha senha" (e-mail de redefinição) e exclusão da conta (com reautenticação por senha).
- **Sessão persistente:** o Firebase Auth é inicializado com `getReactNativePersistence(AsyncStorage)`; ao reabrir o app o usuário continua logado.
- **CRUD de treinos no Firestore:** cadastrar, listar, editar, marcar como concluído e excluir (com confirmação).
- **Isolamento de dados:** os treinos ficam em `usuarios/{uid}/treinos`; o app sempre usa o `uid` do usuário autenticado e as regras do Firestore bloqueiam o acesso a dados de outros usuários.
- **Interface:** validação de formulários, mensagens de erro e sucesso, indicadores de carregamento, estados vazios ("Nenhum treino encontrado"), busca, filtros e "puxar para atualizar".

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Navegação | React Navigation (native-stack + bottom-tabs) |
| Autenticação | Firebase Authentication (e-mail/senha) |
| Banco de dados | Cloud Firestore |
| Persistência da sessão | AsyncStorage (`getReactNativePersistence`) |
| Estado remoto / cache | TanStack Query (`useQuery` / `useMutation`) |
| Ícones | `@expo/vector-icons` (Feather) |

## Estrutura básica do Firestore

```
usuarios                               (coleção)
 └── {uid}                             (documento do usuário — id = uid do Firebase Auth)
      ├── nome: string
      ├── email: string
      ├── telefone: string | null
      ├── criadoEm: timestamp
      └── treinos                      (subcoleção)
           ├── {treinoId}
           │    ├── nome: string            "Treino A — Peito e Tríceps"
           │    ├── exercicios: string      "Supino reto 4x10\nCrucifixo 3x12"
           │    ├── duracaoMin: number      60
           │    ├── calorias: number|null   350
           │    ├── grupoMuscular: string   "PEITO" | "COSTAS" | "PERNAS" | ...
           │    ├── diaSemana: string       "SEG" | "TER" | ... | "DOM"
           │    ├── intensidade: string     "LEVE" | "MODERADA" | "INTENSA"
           │    ├── concluido: boolean
           │    ├── usuarioId: string       (uid do dono)
           │    ├── criadoEm: timestamp
           │    └── atualizadoEm: timestamp
           └── ...
```

> **A senha nunca é armazenada** — nem no Firestore, nem no AsyncStorage. Ela só é enviada ao Firebase Authentication.

### Regras de segurança

As regras estão em [`firestore.rules`](./firestore.rules). Resumo:

- `usuarios/{uid}` e `usuarios/{uid}/treinos/**` só podem ser lidos/escritos quando `request.auth.uid == uid`;
- treinos só são aceitos com os campos obrigatórios válidos e com `usuarioId` igual ao dono;
- qualquer outro caminho do banco é negado.

## Arquitetura do projeto

```
fitflow-mobile/
├── App.js                        # Providers (QueryClient, Auth) + Routes
├── app.json / babel.config.js / metro.config.js
├── firebase.json / firestore.rules / firestore.indexes.json
├── assets/                       # icon.png, splash.png
└── src/
    ├── config/
    │   ├── firebaseConfig.js     # ÚNICO lugar para colar as credenciais do Firebase
    │   └── firebase.js           # initializeApp + Auth (AsyncStorage) + Firestore
    ├── constants/
    │   ├── theme.js              # Cores, tipografia, espaçamento
    │   └── treinos.js            # Grupos musculares, dias da semana, intensidades
    ├── services/                 # Única camada que fala com o Firebase
    │   ├── authService.js        # cadastro, login, logout, recuperar senha, excluir conta
    │   ├── usuariosService.js    # documento usuarios/{uid}
    │   ├── treinosService.js     # CRUD usuarios/{uid}/treinos
    │   └── queryClient.js
    ├── contexts/
    │   └── AuthContext.js        # onAuthStateChanged, sessão e ações de auth
    ├── hooks/                    # TanStack Query — isola leitura/escrita da UI
    │   ├── useTreinos.js
    │   └── usePerfil.js
    ├── utils/
    │   ├── firebaseErros.js      # tradução dos códigos de erro do Firebase
    │   └── alertas.js            # avisos e confirmações (mobile e web)
    ├── components/               # Header, CustomInput, PrimaryButton, ChipSelector,
    │                             # TreinoCard, StatCard, EmptyState, LoadingOverlay,
    │                             # ConfirmarSenhaModal
    ├── routes/
    │   ├── index.js              # Decide AuthRoutes x AppRoutes (proteção de rotas)
    │   ├── auth.routes.js
    │   ├── app.routes.js
    │   └── tab.routes.js
    └── screens/
        ├── auth/     (Login, Cadastro, EsqueciSenha)
        ├── treinos/  (ListaTreinos, TreinoForm, Semana)
        └── Home.js, Perfil.js
```

**Separação de responsabilidades:** as telas nunca chamam o SDK do Firebase diretamente. Elas usam hooks (`useTreinos`, `usePerfil`) ou o `AuthContext`, que chamam os `services`. Os hooks pegam o `uid` do usuário autenticado no próprio `AuthContext`, então nenhuma tela consegue gravar ou ler treinos de outro usuário.

## Telas

| Área | Tela | Função |
|---|---|---|
| Não autenticada | **Login** | Entrar com e-mail e senha; links para cadastro e recuperação |
| Não autenticada | **Cadastro** | Criar conta (nome, e-mail, telefone, senha, confirmação) |
| Não autenticada | **Esqueci minha senha** | Enviar e-mail de redefinição |
| Autenticada | **Início (Home)** | Resumo: total de treinos, concluídos, minutos na semana, progresso e treinos de hoje |
| Autenticada | **Meus Treinos (listagem)** | Lista do Firestore com busca, filtros, concluir, editar e excluir |
| Autenticada | **Novo Treino / Editar Treino** | Formulário com validação (Create / Update) |
| Autenticada | **Minha Semana** | Treinos agrupados por dia da semana |
| Autenticada | **Minha Conta (Perfil)** | Nome, e-mail, telefone, data de cadastro, logout e excluir conta |

## Instruções para instalação

### 1. Pré-requisitos

- Node.js 18 ou superior
- App **Expo Go** no celular (ou um emulador Android/iOS)
- Uma conta Google para acessar o [Console do Firebase](https://console.firebase.google.com)

### 2. Configurar o Firebase

1. No Console do Firebase, crie um projeto.
2. **Authentication** → *Começar* → *Método de login* → habilite **E-mail/senha**.
3. **Firestore Database** → *Criar banco de dados* (modo produção, região `southamerica-east1` por exemplo).
4. **Firestore Database → Regras:** cole o conteúdo de [`firestore.rules`](./firestore.rules) e clique em **Publicar**.
   (Ou, com a Firebase CLI: `firebase deploy --only firestore:rules`.)
5. **Configurações do projeto** (engrenagem) → *Seus apps* → adicione um app **Web** (`</>`) e copie o objeto `firebaseConfig`.
6. Cole os valores em **`src/config/firebaseConfig.js`**:

```js
export const firebaseConfig = {
  apiKey: '...',
  authDomain: 'seu-projeto.firebaseapp.com',
  projectId: 'seu-projeto',
  storageBucket: 'seu-projeto.appspot.com',
  messagingSenderId: '...',
  appId: '...',
};
```

> Enquanto as credenciais não forem preenchidas, o app mostra uma tela "Configure o Firebase" em vez de erros.

### 3. Instalar as dependências

```bash
npm install
npx expo install --fix   # alinha as versões com o Expo SDK 54
```

## Instruções para execução

```bash
npx expo start
```

- Escaneie o QR Code com o **Expo Go** (Android) ou com a câmera (iOS);
- ou pressione `a` para abrir no emulador Android / `i` no simulador iOS;
- ou `w` para abrir no navegador (Expo Web).

## Roteiro do vídeo (checklist do CP5)

1. **Cadastro** — criar uma conta nova.
2. **Login** — entrar com a conta criada.
3. **Cadastro no Firestore** — criar pelo menos 2 treinos.
4. **Consulta** — mostrar a lista em *Meus Treinos* (e os documentos no Console do Firebase em `usuarios/{uid}/treinos`).
5. **Atualização** — editar um treino (ex.: mudar a duração) e ver a lista atualizada.
6. **Exclusão** — excluir um treino (com confirmação) e ver que ele sumiu da lista.
7. **Isolamento** — sair, entrar com outro usuário e mostrar que os treinos do primeiro não aparecem.
8. **Logout** — sair e voltar para a tela de login.
9. **Persistência** — fechar e reabrir o app, mostrando que a sessão continua ativa.

## Requisitos do CP5 atendidos

| Requisito | Onde |
|---|---|
| Cadastro, login, logout, recuperação de senha, exclusão da conta | `services/authService.js`, `contexts/AuthContext.js`, telas `auth/` e `Perfil.js` |
| Persistência da sessão com AsyncStorage | `config/firebase.js` (`getReactNativePersistence(AsyncStorage)`) |
| Create / Read / Update / Delete no Firestore | `services/treinosService.js` + `hooks/useTreinos.js` |
| Formulário com 4+ campos e validação | `screens/treinos/TreinoForm.js` (4 campos de texto + 3 seletores + status) |
| Registros vinculados ao usuário (subcoleção) | `usuarios/{uid}/treinos` |
| Mensagem quando não há registros | `ListaTreinos.js`, `Semana.js`, `Home.js` |
| Confirmação antes de excluir + feedback | `ListaTreinos.js` (`confirmar` / `avisar`) |
| Perfil com nome, e-mail, logout e excluir conta | `screens/Perfil.js` |
| Área autenticada protegida | `routes/index.js` |
| Senha não armazenada no Firestore/AsyncStorage | `authService.js`, `usuariosService.js`, regras do Firestore |
| Regras de segurança do Firestore | `firestore.rules` |

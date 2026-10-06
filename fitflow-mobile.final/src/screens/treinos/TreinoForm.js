// src/screens/treinos/TreinoForm.js
// Tela de Cadastro / Edição de Treino — CREATE e UPDATE do CRUD no Firestore.
// Modo "cadastrar" quando a rota não recebe treinoId; modo "editar" quando
// recebe (os dados são carregados do Firestore e preenchem o formulário).
//
// O usuário dono do treino NUNCA é digitado: o hook usa o uid do usuário
// autenticado para gravar em usuarios/{uid}/treinos.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import ChipSelector from '../../components/ChipSelector';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingOverlay from '../../components/LoadingOverlay';
import EmptyState from '../../components/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { GRUPOS_MUSCULARES, DIAS_SEMANA, INTENSIDADES, diaDeHoje } from '../../constants/treinos';
import { useTreino, useCreateTreino, useUpdateTreino } from '../../hooks/useTreinos';
import { useAuth } from '../../contexts/AuthContext';
import { mensagemErroFirebase } from '../../utils/firebaseErros';
import { avisar } from '../../utils/alertas';

const somenteNumero = (texto) => texto.replace(/[^0-9]/g, '');

export default function TreinoForm({ navigation, route }) {
  const treinoId = route.params?.treinoId;
  const modoEdicao = !!treinoId;
  const { usuario } = useAuth();

  const { data: treinoExistente, isLoading: carregandoTreino, isError } = useTreino(treinoId);
  const createTreino = useCreateTreino();
  const updateTreino = useUpdateTreino();
  const salvando = createTreino.isPending || updateTreino.isPending;

  const [nome, setNome] = useState('');
  const [exercicios, setExercicios] = useState('');
  const [duracaoMin, setDuracaoMin] = useState('');
  const [calorias, setCalorias] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState(null);
  const [diaSemana, setDiaSemana] = useState(modoEdicao ? null : diaDeHoje());
  const [intensidade, setIntensidade] = useState('MODERADA');
  const [concluido, setConcluido] = useState(false);
  const [erros, setErros] = useState({});

  // Edição: preenche o formulário com os dados vindos do Firestore.
  useEffect(() => {
    if (treinoExistente) {
      setNome(treinoExistente.nome || '');
      setExercicios(treinoExistente.exercicios || '');
      setDuracaoMin(treinoExistente.duracaoMin != null ? String(treinoExistente.duracaoMin) : '');
      setCalorias(treinoExistente.calorias != null ? String(treinoExistente.calorias) : '');
      setGrupoMuscular(treinoExistente.grupoMuscular || null);
      setDiaSemana(treinoExistente.diaSemana || null);
      setIntensidade(treinoExistente.intensidade || 'MODERADA');
      setConcluido(!!treinoExistente.concluido);
    }
  }, [treinoExistente]);

  const limparErro = (campo) => setErros((e) => ({ ...e, [campo]: null }));

  const validar = () => {
    const e = {};
    if (!nome.trim()) e.nome = 'O nome do treino é obrigatório.';
    else if (nome.trim().length < 3) e.nome = 'Use pelo menos 3 caracteres.';
    if (!exercicios.trim()) e.exercicios = 'Liste ao menos um exercício.';
    if (!duracaoMin) e.duracaoMin = 'A duração é obrigatória.';
    else if (Number(duracaoMin) <= 0 || Number(duracaoMin) > 600) e.duracaoMin = 'Informe entre 1 e 600 minutos.';
    if (calorias && (Number(calorias) <= 0 || Number(calorias) > 5000)) e.calorias = 'Informe entre 1 e 5000 kcal.';
    if (!grupoMuscular) e.grupoMuscular = 'Selecione o grupo muscular.';
    if (!diaSemana) e.diaSemana = 'Selecione o dia da semana.';
    if (!intensidade) e.intensidade = 'Selecione a intensidade.';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleSalvar = () => {
    if (!validar()) return;
    if (!usuario?.uid) {
      avisar('Sessão inválida', 'Não foi possível identificar o usuário logado. Faça login novamente.');
      return;
    }

    const dados = {
      nome: nome.trim(),
      exercicios: exercicios.trim(),
      duracaoMin: Number(duracaoMin),
      calorias: calorias ? Number(calorias) : null,
      grupoMuscular,
      diaSemana,
      intensidade,
      concluido,
    };

    const onError = (error) =>
      avisar('Erro', mensagemErroFirebase(error, 'Não foi possível salvar o treino. Tente novamente.'));

    if (modoEdicao) {
      updateTreino.mutate(
        { id: treinoId, dados },
        {
          onSuccess: () => {
            avisar('Treino atualizado', `"${dados.nome}" foi atualizado com sucesso.`);
            navigation.goBack();
          },
          onError,
        },
      );
    } else {
      createTreino.mutate(dados, {
        onSuccess: () => {
          avisar('Treino cadastrado', `"${dados.nome}" foi salvo com sucesso.`);
          navigation.goBack();
        },
        onError,
      });
    }
  };

  if (modoEdicao && carregandoTreino) return <LoadingOverlay mensagem="Carregando treino..." />;

  if (modoEdicao && isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Editar Treino" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="alert-circle"
          title="Não foi possível carregar este treino. Ele pode ter sido excluído."
          actionLabel="Voltar"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={modoEdicao ? 'Editar Treino' : 'Novo Treino'} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <CustomInput
            label="Nome do treino *"
            icon="tag"
            placeholder="Ex.: Treino A — Peito e Tríceps"
            value={nome}
            onChangeText={(t) => { setNome(t); limparErro('nome'); }}
            autoCapitalize="sentences"
            maxLength={60}
            error={erros.nome}
          />

          <CustomInput
            label="Exercícios *"
            icon="list"
            placeholder={'Ex.: Supino reto 4x10\nCrucifixo 3x12\nTríceps corda 3x15'}
            value={exercicios}
            onChangeText={(t) => { setExercicios(t); limparErro('exercicios'); }}
            multiline
            maxLength={500}
            error={erros.exercicios}
          />

          <View style={styles.linha}>
            <CustomInput
              label="Duração (min) *"
              icon="clock"
              placeholder="60"
              value={duracaoMin}
              onChangeText={(t) => { setDuracaoMin(somenteNumero(t)); limparErro('duracaoMin'); }}
              keyboardType="number-pad"
              maxLength={3}
              error={erros.duracaoMin}
              style={styles.metade}
            />
            <CustomInput
              label="Calorias (kcal)"
              icon="zap"
              placeholder="350"
              value={calorias}
              onChangeText={(t) => { setCalorias(somenteNumero(t)); limparErro('calorias'); }}
              keyboardType="number-pad"
              maxLength={4}
              error={erros.calorias}
              style={styles.metade}
            />
          </View>

          <ChipSelector
            label="Grupo muscular *"
            opcoes={GRUPOS_MUSCULARES}
            valor={grupoMuscular}
            onChange={(v) => { setGrupoMuscular(v); limparErro('grupoMuscular'); }}
            error={erros.grupoMuscular}
          />

          <ChipSelector
            label="Dia da semana *"
            opcoes={DIAS_SEMANA}
            valor={diaSemana}
            onChange={(v) => { setDiaSemana(v); limparErro('diaSemana'); }}
            error={erros.diaSemana}
            compacto
          />

          <ChipSelector
            label="Intensidade *"
            opcoes={INTENSIDADES}
            valor={intensidade}
            onChange={(v) => { setIntensidade(v); limparErro('intensidade'); }}
            error={erros.intensidade}
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Treino concluído</Text>
              <Text style={styles.switchHint}>Marque quando finalizar este treino na semana.</Text>
            </View>
            <Switch
              value={concluido}
              onValueChange={setConcluido}
              trackColor={{ false: COLORS.border, true: COLORS.success + '88' }}
              thumbColor={concluido ? COLORS.success : COLORS.white}
            />
          </View>

          <View style={styles.donoInfo}>
            <Feather name="lock" size={14} color={COLORS.textMuted} />
            <Text style={styles.donoInfoText}>
              Salvo na conta de <Text style={{ fontWeight: '700' }}>{usuario?.nome || usuario?.email}</Text>
            </Text>
          </View>

          <PrimaryButton
            label={modoEdicao ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR TREINO'}
            icon="save"
            onPress={handleSalvar}
            loading={salvando}
            style={{ marginTop: SPACING.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  linha: { flexDirection: 'row', gap: SPACING.md },
  metade: { flex: 1, width: undefined },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  switchLabel: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: '700' },
  switchHint: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  donoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  donoInfoText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
});

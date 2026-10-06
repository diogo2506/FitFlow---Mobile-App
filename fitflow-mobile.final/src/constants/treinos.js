// src/constants/treinos.js
// Opções fixas usadas no formulário e nos cards de treino.
// (São apenas rótulos de seleção — os treinos em si vêm sempre do Firestore.)

import { COLORS } from './theme';

export const GRUPOS_MUSCULARES = [
  { value: 'PEITO', label: 'Peito' },
  { value: 'COSTAS', label: 'Costas' },
  { value: 'PERNAS', label: 'Pernas' },
  { value: 'OMBROS', label: 'Ombros' },
  { value: 'BRACOS', label: 'Braços' },
  { value: 'ABDOMEN', label: 'Abdômen' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'FULLBODY', label: 'Full body' },
];

// Ordem de segunda a domingo (padrão de academia).
export const DIAS_SEMANA = [
  { value: 'SEG', label: 'Seg', nome: 'Segunda-feira' },
  { value: 'TER', label: 'Ter', nome: 'Terça-feira' },
  { value: 'QUA', label: 'Qua', nome: 'Quarta-feira' },
  { value: 'QUI', label: 'Qui', nome: 'Quinta-feira' },
  { value: 'SEX', label: 'Sex', nome: 'Sexta-feira' },
  { value: 'SAB', label: 'Sáb', nome: 'Sábado' },
  { value: 'DOM', label: 'Dom', nome: 'Domingo' },
];

export const INTENSIDADES = [
  { value: 'LEVE', label: 'Leve', color: COLORS.leve },
  { value: 'MODERADA', label: 'Moderada', color: COLORS.moderada },
  { value: 'INTENSA', label: 'Intensa', color: COLORS.intensa },
];

const porValor = (lista) => Object.fromEntries(lista.map((item) => [item.value, item]));

export const GRUPO_POR_VALOR = porValor(GRUPOS_MUSCULARES);
export const DIA_POR_VALOR = porValor(DIAS_SEMANA);
export const INTENSIDADE_POR_VALOR = porValor(INTENSIDADES);

/** Dia da semana de hoje no mesmo formato salvo no Firestore ('SEG', 'TER'...). */
export function diaDeHoje() {
  // getDay(): 0 = domingo ... 6 = sábado
  const mapa = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  return mapa[new Date().getDay()];
}

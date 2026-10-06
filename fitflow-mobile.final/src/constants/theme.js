// src/constants/theme.js
// Identidade visual do FitFlow — controle de treinos de academia

export const COLORS = {
  // Cores primárias
  background: '#F5F6FB',      // Fundo geral (cinza-lavanda bem claro)
  surface: '#FFFFFF',         // Superfície de cards
  surfaceAlt: '#ECEBFD',      // Cards/seções alternativas
  primary: '#4F46E5',         // Índigo (marca FitFlow)
  primaryDark: '#3730A3',     // Índigo escuro (pressed/headers)
  secondary: '#F97316',       // Laranja energia (destaques)
  secondaryDark: '#C2410C',   // Laranja escuro

  // Intensidade do treino
  leve: '#22A06B',            // Verde
  moderada: '#F59E0B',        // Âmbar
  intensa: '#E5484D',         // Vermelho

  // Status
  critical: '#E5484D',        // Vermelho (erros / exclusão)
  warning: '#F59E0B',         // Amarelo
  success: '#22A06B',         // Verde (concluído)

  // Textos
  textPrimary: '#1B1D2E',     // Quase preto azulado
  textSecondary: '#5A5F7A',   // Cinza-azulado médio
  textMuted: '#9196B0',       // Cinza-azulado claro

  // Bordas
  border: '#E1E3F0',
  borderLight: '#ECEBFD',

  // Overlay
  overlay: 'rgba(20, 20, 45, 0.55)',
  white: '#FFFFFF',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 100,
};

export const SHADOW = {
  card: {
    shadowColor: '#1B1D4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

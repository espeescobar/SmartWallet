import { PerfilFinanciero } from '../utils/budgetCalculator';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Perfilamiento: { email: string; password: string };
  PresupuestoSugerido: {
    perfil: PerfilFinanciero;
    email?: string;
    password?: string;
  };
  MainTabs: undefined;
};

export type MainTabParamList = {
  Inicio: undefined;
  Objetivos: undefined;
  Analíticas: undefined;
  Aprende: undefined;
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { sumaCategorias } from './budgetCalculator';

export interface UserProfileStored {
  perfil: {
    ingresos: number;
    gastos: number;
    cuentasBasicas: number;
    objetivosAhorro: number;
  };
  categorias: { monto: number }[];
  metas: { montoMensual: number }[];
}

export type BudgetAlertLevel = 'ok' | 'warning' | 'danger' | 'savings_blocked';

export interface BudgetStatus {
  level: BudgetAlertLevel;
  presupuestoTotal: number;
  gastosMes: number;
  porcentajeUsado: number;
  ahorroMensual: number;
  saldoDisponible: number;
  mensaje: string | null;
}

const UMBRAL_ADVERTENCIA = 0.8;

export async function loadUserProfile(): Promise<UserProfileStored | null> {
  try {
    const raw = await AsyncStorage.getItem('user_profile');
    if (!raw) return null;
    return JSON.parse(raw) as UserProfileStored;
  } catch {
    return null;
  }
}

export function calcularPresupuestoTotal(profile: UserProfileStored | null, monthlyIncome: number): number {
  if (profile?.perfil?.ingresos && profile.perfil.ingresos > 0) {
    return profile.perfil.ingresos;
  }
  if (monthlyIncome > 0) return monthlyIncome;
  if (!profile) return 0;
  const gastosFijos = profile.perfil.gastos + profile.perfil.cuentasBasicas;
  const categorias = sumaCategorias(profile.categorias as Parameters<typeof sumaCategorias>[0]);
  const metas = profile.metas.reduce((s, m) => s + m.montoMensual, 0);
  return gastosFijos + categorias + metas;
}

export function evaluarPresupuesto(
  gastosMes: number,
  ingresoMes: number,
  presupuestoTotal: number,
  ahorroMensual: number,
): BudgetStatus {
  const base = presupuestoTotal > 0 ? presupuestoTotal : ingresoMes;
  const porcentajeUsado = base > 0 ? gastosMes / base : 0;
  const saldoDisponible = base - gastosMes;

  if (base <= 0) {
    return {
      level: 'ok',
      presupuestoTotal: base,
      gastosMes,
      porcentajeUsado: 0,
      ahorroMensual,
      saldoDisponible,
      mensaje: null,
    };
  }

  if (saldoDisponible < ahorroMensual && ahorroMensual > 0) {
    return {
      level: 'savings_blocked',
      presupuestoTotal: base,
      gastosMes,
      porcentajeUsado,
      ahorroMensual,
      saldoDisponible,
      mensaje: `Tus gastos impiden cumplir tu meta de ahorro mensual de $${ahorroMensual.toLocaleString('es-CL')}`,
    };
  }

  if (porcentajeUsado >= 1) {
    return {
      level: 'danger',
      presupuestoTotal: base,
      gastosMes,
      porcentajeUsado,
      ahorroMensual,
      saldoDisponible,
      mensaje: 'Superaste tu presupuesto mensual. Revisa tus gastos prioritarios.',
    };
  }

  if (porcentajeUsado >= UMBRAL_ADVERTENCIA) {
    return {
      level: 'warning',
      presupuestoTotal: base,
      gastosMes,
      porcentajeUsado,
      ahorroMensual,
      saldoDisponible,
      mensaje: `Llevas el ${Math.round(porcentajeUsado * 100)}% de tu presupuesto mensual.`,
    };
  }

  return {
    level: 'ok',
    presupuestoTotal: base,
    gastosMes,
    porcentajeUsado,
    ahorroMensual,
    saldoDisponible,
    mensaje: null,
  };
}

export function filtrarUltimaSemana<T extends { transaction_date: string }>(items: T[]): T[] {
  const limite = new Date();
  limite.setDate(limite.getDate() - 7);
  limite.setHours(0, 0, 0, 0);
  return items.filter((tx) => new Date(tx.transaction_date) >= limite);
}

export function sumarGastos(items: { amount: number; type: string }[]): number {
  return items
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
}

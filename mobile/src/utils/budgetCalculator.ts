export interface PerfilFinanciero {
  ingresos: number;
  gastos: number;
  cuentasBasicas: number;
  objetivosAhorro: number;
}

export interface CategoriaPresupuesto {
  id: string;
  nombre: string;
  icono: string;
  monto: number;
}

export interface MetaSugerida {
  id: string;
  nombre: string;
  montoMensual: number;
  meses: number;
  montoTotal: number;
}

export interface PropuestaPresupuesto {
  categorias: CategoriaPresupuesto[];
  metas: MetaSugerida[];
  gastosFijosExcedenIngresos: boolean;
  ingresoTotal: number;
}

const CATEGORIAS_BASE = [
  { nombre: 'Alimentación', icono: '🍽️', porcentaje: 0.25 },
  { nombre: 'Ocio', icono: '🎮', porcentaje: 0.12 },
  { nombre: 'Transporte', icono: '🚌', porcentaje: 0.15 },
  { nombre: 'Salud', icono: '💊', porcentaje: 0.08 },
  { nombre: 'Educación', icono: '📚', porcentaje: 0.05 },
];

export function generarPropuesta(perfil: PerfilFinanciero): PropuestaPresupuesto {
  const ingresoTotal = perfil.ingresos;
  const gastosFijos = perfil.gastos + perfil.cuentasBasicas;
  const gastosFijosExcedenIngresos = gastosFijos > ingresoTotal && ingresoTotal > 0;

  const disponible = Math.max(ingresoTotal - gastosFijos - perfil.objetivosAhorro, 0);

  const categorias: CategoriaPresupuesto[] = CATEGORIAS_BASE.map((cat, i) => ({
    id: `cat-${i}`,
    nombre: cat.nombre,
    icono: cat.icono,
    monto: Math.round(disponible * cat.porcentaje),
  }));

  const metas: MetaSugerida[] = [];
  if (perfil.objetivosAhorro > 0) {
    metas.push({
      id: 'meta-0',
      nombre: 'Fondo de emergencia',
      montoMensual: perfil.objetivosAhorro,
      meses: 12,
      montoTotal: perfil.objetivosAhorro * 12,
    });
  }

  return { categorias, metas, gastosFijosExcedenIngresos, ingresoTotal };
}

export function sumaCategorias(categorias: CategoriaPresupuesto[]): number {
  return categorias.reduce((sum, c) => sum + c.monto, 0);
}

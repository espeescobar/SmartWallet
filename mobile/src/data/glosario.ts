export interface TerminoFinanciero {
  id: string;
  termino: string;
  definicion: string;
  categoria: string;
}

export const GLOSARIO_LOCAL: TerminoFinanciero[] = [
  {
    id: '1',
    termino: 'Presupuesto',
    definicion: 'Plan que organiza tus ingresos y gastos para saber en qué se va tu dinero cada mes.',
    categoria: 'Presupuesto',
  },
  {
    id: '2',
    termino: 'Ingreso líquido',
    definicion: 'El dinero que realmente recibes después de descuentos legales, como impuestos y cotizaciones.',
    categoria: 'Ingresos',
  },
  {
    id: '3',
    termino: 'Gasto fijo',
    definicion: 'Gasto que se repite todos los meses con un monto similar, como arriendo o luz.',
    categoria: 'Gastos',
  },
  {
    id: '4',
    termino: 'Ahorro',
    definicion: 'Parte del dinero que guardas para el futuro en lugar de gastarlo hoy.',
    categoria: 'Ahorro',
  },
  {
    id: '5',
    termino: 'Interés compuesto',
    definicion: 'Cuando tus ahorros generan ganancias y esas ganancias también empiezan a producir más dinero.',
    categoria: 'Inversiones',
  },
  {
    id: '6',
    termino: 'Fondo de emergencia',
    definicion: 'Reserva de dinero para imprevistos, como una enfermedad o pérdida de empleo.',
    categoria: 'Ahorro',
  },
  {
    id: '7',
    termino: 'Deuda',
    definicion: 'Dinero que debes a otra persona o institución y que debes devolver con o sin intereses.',
    categoria: 'Deuda',
  },
  {
    id: '8',
    termino: 'Meta financiera',
    definicion: 'Objetivo concreto con un monto y plazo, como juntar para un viaje o un auto.',
    categoria: 'Ahorro',
  },
];

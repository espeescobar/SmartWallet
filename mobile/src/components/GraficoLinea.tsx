import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/Estadisticas.styles';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  transaction_date?: string; 
}

export type FiltroTemporal = 'semana' | 'mes' | 'trimestre' | 'anio';

interface Props {
  transactions: Transaction[];
  filtro: FiltroTemporal;
}

function generarDatosDinamicos(transacciones: Transaction[], filtro: FiltroTemporal) {
  const now = new Date();
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const parsearFecha = (rawDate: string | undefined) => {
    if (!rawDate) return null;
    const soloFecha = rawDate.toString().slice(0, 10); 
    const d = new Date(soloFecha + 'T12:00:00Z');
    return isNaN(d.getTime()) ? null : d;
  };

  if (filtro === 'semana') {
    const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const data = labels.map(label => ({ label, value: 0 }));
    
    transacciones.forEach(tx => {
      const d = parsearFecha(tx.transaction_date || tx.date);
      if (!d) return; 
      let day = d.getDay(); 
      day = day === 0 ? 6 : day - 1; 
      if (data[day]) data[day].value += Number(tx.amount);
    });
    return data;
  }

  if (filtro === 'mes') {
    const labels = ['S1', 'S2', 'S3', 'S4', 'S5'];
    const data = labels.map(label => ({ label, value: 0 }));
    
    transacciones.forEach(tx => {
      const d = parsearFecha(tx.transaction_date || tx.date);
      if (!d) return;
      const dateNum = d.getDate(); 
      let weekIndex = Math.floor((dateNum - 1) / 7);
      if (weekIndex > 4) weekIndex = 4; 
      if (data[weekIndex]) data[weekIndex].value += Number(tx.amount);
    });
    return data;
  }

  if (filtro === 'trimestre') {
    const currentMonth = now.getMonth();
    const m1 = (currentMonth - 2 + 12) % 12;
    const m2 = (currentMonth - 1 + 12) % 12;
    const m3 = currentMonth;
    
    const data = [
      { label: monthNames[m1], value: 0, targetMonth: m1 },
      { label: monthNames[m2], value: 0, targetMonth: m2 },
      { label: monthNames[m3], value: 0, targetMonth: m3 },
    ];

    transacciones.forEach(tx => {
      const d = parsearFecha(tx.transaction_date || tx.date);
      if (!d) return;
      const bucket = data.find(b => b.targetMonth === d.getMonth());
      if (bucket) bucket.value += Number(tx.amount);
    });
    
    return data.map(d => ({ label: d.label, value: d.value }));
  }

  if (filtro === 'anio') {
    const data = monthNames.map(label => ({ label, value: 0 }));
    transacciones.forEach(tx => {
      const d = parsearFecha(tx.transaction_date || tx.date);
      if (!d) return;
      const monthIndex = d.getMonth();
      if (data[monthIndex]) data[monthIndex].value += Number(tx.amount);
    });
    return data;
  }

  return [];
}

// Función para achicar números (Ej: 15000 -> 15k)
const formatearMonto = (valor: number) => {
  if (valor >= 1000000) return (valor / 1000000).toFixed(1) + 'M';
  if (valor >= 1000) return (valor / 1000).toFixed(1) + 'k';
  return valor.toString();
};

export default function GraficoLinea({ transactions, filtro }: Props) {
  const data = useMemo(() => generarDatosDinamicos(transactions, filtro), [transactions, filtro]);
  const max = Math.max(...data.map((d) => d.value), 1);

  if (transactions.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
         <Text style={{ color: '#888' }}>No hay gastos para este período.</Text>
      </View>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      {/* CONTENEDOR PRINCIPAL INDEPENDIENTE DEL CSS EXTERNO */}
      <View style={{ height: 180, flexDirection: 'row', width: '100%', paddingBottom: 10 }}>
        
        {data.map((punto) => {
          // Calculamos la altura aquí afuera para que sea 100% segura
          const alturaBarra = max > 0 ? Math.max((punto.value / max) * 130, 4) : 4;

          return (
            <View key={punto.label} style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
              
              {/* TEXTO DEL MONTO */}
              {punto.value > 0 && (
                <Text 
                  numberOfLines={1}
                  style={{ fontSize: 10, color: '#1A1A1A', marginBottom: 4, fontWeight: 'bold' }}
                >
                  ${formatearMonto(punto.value)}
                </Text>
              )}

              {/* BARRA PURA (Sin usar styles.lineBar) */}
              <View
                style={{
                  height: alturaBarra, // Usamos la variable calculada arriba
                  width: 24,           // Ancho fijo en lugar de porcentaje
                  backgroundColor: '#005AD6', 
                  borderRadius: 4,
                  opacity: punto.value > 0 ? 1 : 0.1,
                }}
              />
            </View>
          );
        })}
      </View>

      {/* ETIQUETAS INFERIORES */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        {data.map((punto) => (
          <Text key={punto.label} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#6E6E73' }}>
            {punto.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
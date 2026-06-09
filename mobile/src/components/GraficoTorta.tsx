import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../styles/App.styles';
import { styles } from '../styles/Estadisticas.styles';

interface Segmento {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: Segmento[];
}

// Paleta ajustada para mantener la cohesión visual de la app
const CHART_COLORS = ['#005AD6', '#6E6E73', '#1A1A1A'];

export default function GraficoTorta({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <Text style={styles.emptyChart}>Sin datos para mostrar</Text>;
  }

  let acumulado = 0;

  return (
    <View style={{ width: '100%' }}>
      <View style={styles.pieContainer}>
        {data.map((seg, i) => {
          const pct = seg.value / total;
          const rotation = acumulado * 360;
          acumulado += pct;
          
          // Forzamos el uso de la paleta iterando con el índice
          const colorFinal = CHART_COLORS[i % CHART_COLORS.length];

          return (
            <View
              key={seg.label}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: [{ rotate: `${rotation}deg` }],
              }}
            >
              <View
                style={{
                  width: '50%',
                  height: '100%',
                  backgroundColor: colorFinal,
                  transformOrigin: 'right center',
                  transform: [{ rotate: `${Math.min(pct * 360, 180)}deg` }],
                  borderTopLeftRadius: 80,
                  borderBottomLeftRadius: 80,
                }}
              />
            </View>
          );
        })}
        <View
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.fondo,
            top: 40,
            left: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.negro }}>
            ${total.toLocaleString('es-CL')}
          </Text>
        </View>
      </View>

      {data.map((seg, i) => {
        const colorFinal = CHART_COLORS[i % CHART_COLORS.length];
        
        return (
          <View key={seg.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colorFinal }]} />
            <Text style={styles.legendLabel}>{seg.label}</Text>
            <Text style={styles.legendValue}>
              ${seg.value.toLocaleString('es-CL')} ({Math.round((seg.value / total) * 100)}%)
            </Text>
          </View>
        );
      })}
    </View>
  );
}
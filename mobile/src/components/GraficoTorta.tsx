import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
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


const CHART_COLORS = ['#005AD6', '#6E6E73', '#1A1A1A', '#D9EBFF' ];

export default function GraficoTorta({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <Text style={styles.emptyChart}>Sin datos para mostrar</Text>;
  }

  // Dimensiones del gráfico
  const size = 160;
  const radius = size / 2;
  const center = radius;
  const innerRadius = radius - 35; // Grosor de la dona (puedes ajustarlo)

  let currentAngle = 0;

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      
      {/* Contenedor del Gráfico */}
      <View style={[styles.pieContainer, { width: size, height: size, justifyContent: 'center', alignItems: 'center', position: 'relative' }]}>
        
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Rotamos -90deg para que el gráfico empiece a dibujarse desde las 12 en punto */}
          <G transform={`rotate(-90 ${center} ${center})`}>
            {data.map((seg, i) => {
              const pct = seg.value / total;
              const angle = pct * 360;

              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle = endAngle;

              const colorFinal = seg.color || CHART_COLORS[i % CHART_COLORS.length];

              // Si una categoría es el 100%, dibujamos un círculo completo
              if (pct === 1) {
                return <Circle key={seg.label} cx={center} cy={center} r={radius} fill={colorFinal} />;
              }

              // Fórmulas trigonométricas para calcular los bordes exactos del pedazo de torta
              const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
              const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
              const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
              const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              // Trazado del vector
              const d = [
                `M ${center} ${center}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              return <Path key={seg.label} d={d} fill={colorFinal} />;
            })}
          </G>
          
          {/* Círculo central para hacer el efecto de "Dona" */}
          <Circle cx={center} cy={center} r={innerRadius} fill={Colors.fondo || '#FFFFFF'} />
        </Svg>

        {/* Texto central del Total Gastado */}
        <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.negro }}>
            ${total.toLocaleString('es-CL')}
          </Text>
        </View>

      </View>

      {/* Leyenda Inferior */}
      <View style={{ width: '100%', marginTop: 20 }}>
        {data.map((seg, i) => {
          const colorFinal = seg.color || CHART_COLORS[i % CHART_COLORS.length];
          const pct = Math.round((seg.value / total) * 100);
          
          return (
            <View key={seg.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: colorFinal }]} />
              <Text style={styles.legendLabel}>{seg.label}</Text>
              <Text style={styles.legendValue}>
                ${seg.value.toLocaleString('es-CL')} ({pct}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
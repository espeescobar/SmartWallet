import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../styles/App.styles';
import { styles } from '../styles/Estadisticas.styles';

interface Punto {
  label: string;
  value: number;
}

interface Props {
  data: Punto[];
}

export default function GraficoLinea({ data }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.every((d) => d.value === 0)) {
    return <Text style={styles.emptyChart}>Sin gastos en este periodo</Text>;
  }

  return (
    <View style={{ width: '100%' }}>
      <View style={styles.lineChartContainer}>
        {data.map((punto) => (
          <View key={punto.label} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={[
                styles.lineBar,
                {
                  height: Math.max((punto.value / max) * 100, 4),
                  opacity: punto.value > 0 ? 1 : 0.3,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        {data.map((punto) => (
          <Text key={punto.label} style={[styles.lineLabel, { flex: 1 }]}>
            {punto.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

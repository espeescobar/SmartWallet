import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/HomeScreen.styles';
import { Colors } from '../styles/App.styles';
import { BudgetStatus } from '../utils/budgetStatus';

interface Props {
  status: BudgetStatus;
}

function barColor(level: BudgetStatus['level']): string {
  if (level === 'danger' || level === 'savings_blocked') return Colors.error;
  if (level === 'warning') return '#FF9800';
  return Colors.azul;
}

export default function BudgetAlert({ status }: Props) {
  if (status.level === 'ok' || !status.mensaje) return null;

  const pct = Math.min(Math.round(status.porcentajeUsado * 100), 100);
  const isDanger = status.level === 'danger' || status.level === 'savings_blocked';

  return (
    <View style={[styles.budgetBanner, isDanger ? styles.budgetBannerDanger : styles.budgetBannerWarning]}>
      <Text style={[styles.budgetBannerText, isDanger && styles.budgetBannerTextDanger]}>
        {status.mensaje}
      </Text>
      {status.presupuestoTotal > 0 && (
        <View style={styles.budgetProgressBg}>
          <View
            style={[
              styles.budgetProgressFill,
              { width: `${pct}%`, backgroundColor: barColor(status.level) },
            ]}
          />
        </View>
      )}
      <Text style={styles.budgetSubtext}>
        ${status.gastosMes.toLocaleString('es-CL')} de ${status.presupuestoTotal.toLocaleString('es-CL')}
      </Text>
    </View>
  );
}

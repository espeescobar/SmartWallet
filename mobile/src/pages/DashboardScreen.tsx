import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { styles } from '../styles/DashboardScreen.styles';
import { styles_app } from '../styles/App.styles';
import TarjetaCategoria from '../components/TarjetaCategoria';
import { api } from '../services/api';

interface CategorySummary {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number;
  transaction_count: number;
}

interface DashboardData {
  total_income: number;
  total_expenses: number;
  balance: number;
  categories: CategorySummary[];
}

export default function DashboardScreen() {
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);
  const [data, setData]         = useState<DashboardData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const res = await api.get(`/dashboard/summary?month=${month}`);
      setData(res.data);
    } catch {
      // mantiene el estado anterior
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const toggleCategoria = (id: string) => {
    setCategoriaExpandida(categoriaExpandida === id ? null : id);
  };

  return (
    <SafeAreaView style={styles_app.safeArea}>
      <ScrollView
        style={styles_app.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles_app.screenTitle}>Tus Gastos</Text>
        <Text style={styles_app.subtitle}>Resumen de este mes</Text>

        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>Total Gastado</Text>
          {loading
            ? <ActivityIndicator />
            : <Text style={styles.totalAmount}>
                ${(data?.total_expenses ?? 0).toLocaleString('es-CL')}
              </Text>
          }
        </View>

        <Text style={styles_app.sectionTitle}>¿En qué se te fue la plata?</Text>

        {loading
          ? <ActivityIndicator style={{ marginTop: 20 }} />
          : data?.categories.length === 0
            ? <Text style={{ color: '#888', padding: 16 }}>Sin gastos registrados este mes.</Text>
            : data?.categories.map((cat) => {
                const porcentaje = data.total_expenses > 0
                  ? (cat.total_amount / data.total_expenses) * 100
                  : 0;
                const estaAbierta = categoriaExpandida === cat.category_id;

                // TarjetaCategoria espera la forma original {id, nombre, monto, color, gastos[]}
                const catAdapted = {
                  id:     cat.category_id,
                  nombre: `${cat.category_icon} ${cat.category_name}`,
                  monto:  cat.total_amount,
                  color:  cat.category_color ?? '#D9EBFF',
                  gastos: [],
                };

                return (
                  <TarjetaCategoria
                    key={cat.category_id}
                    cat={catAdapted}
                    porcentaje={porcentaje}
                    estaAbierta={estaAbierta}
                    alPresionar={() => toggleCategoria(cat.category_id)}
                  />
                );
              })
        }

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { styles as dashStyles } from '../styles/DashboardScreen.styles';
import { styles as statsStyles } from '../styles/Estadisticas.styles';
import { styles_app, Colors } from '../styles/App.styles';
import TarjetaCategoria from '../components/TarjetaCategoria';
import GraficoTorta from '../components/GraficoTorta';
import GraficoLinea from '../components/GraficoLinea';
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

type FiltroTemporal = 'semana' | 'mes' | 'trimestre' | 'anio';

const FILTROS: { key: FiltroTemporal; label: string }[] = [
  { key: 'semana', label: 'Semana Actual' },
  { key: 'mes', label: 'Mes Actual' },
  { key: 'trimestre', label: 'Últimos 3 meses' },
  { key: 'anio', label: 'Año' },
];

const CHART_COLORS = [Colors.azul, Colors.celeste, '#7ea4d9', Colors.textoSuave, '#4CAF50', '#FF9800'];

function getDateRange(filtro: FiltroTemporal): { from: string; to: string; month: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  let from: Date;

  switch (filtro) {
    case 'semana': {
      from = new Date(now);
      from.setDate(now.getDate() - now.getDay());
      break;
    }
    case 'trimestre':
      from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case 'anio':
      from = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return {
    from: from.toISOString().slice(0, 10),
    to,
    month: now.toISOString().slice(0, 7),
  };
}

function generarDatosLinea(total: number): { label: string; value: number }[] {
  const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const hoy = new Date().getDay();
  const offset = hoy === 0 ? 6 : hoy - 1;
  return dias.map((label, i) => ({
    label,
    value: i <= offset ? Math.round((total / (offset + 1)) * (0.5 + Math.random())) : 0,
  }));
}

export default function DashboardScreen() {
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);
  const [filtro, setFiltro] = useState<FiltroTemporal>('mes');
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setSinConexion(false);
      const { from, to, month } = getDateRange(filtro);
      const res = await api.get(`/dashboard/summary?month=${month}&from=${from}&to=${to}`);
      setData(res.data);
    } catch {
      setSinConexion(true);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtro]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const toggleCategoria = (id: string) => {
    setCategoriaExpandida(categoriaExpandida === id ? null : id);
  };

  const handleCreateCategory = async () => {
    if (!newName.trim()) {
      Alert.alert('Falta el nombre', 'Dale un nombre a tu nueva categoría.');
      return;
    }
    let parsedBudget: number | undefined;
    if (newBudget.trim() !== '') {
      parsedBudget = parseInt(newBudget, 10);
      if (isNaN(parsedBudget) || parsedBudget < 0) {
        Alert.alert('Monto inválido', 'Ingresa un monto válido');
        return;
      }
    }

    setSaving(true);
    try {
      await api.post('/dashboard/categories', {
        name: newName.trim(),
        type: 'expense',
        budget_amount: parsedBudget,
        icon: '🏷️',
        color: '#005AD6',
      });
      setModalVisible(false);
      setNewName('');
      setNewBudget('');
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'No se pudo crear la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const pieData = (data?.categories ?? []).map((cat, i) => ({
    label: `${cat.category_icon} ${cat.category_name}`,
    value: cat.total_amount,
    color: cat.category_color || CHART_COLORS[i % CHART_COLORS.length],
  }));

  const lineData = useMemo(
    () => generarDatosLinea(data?.total_expenses ?? 0),
    [data?.total_expenses, filtro]
  );

  return (
    <SafeAreaView style={styles_app.safeArea}>
      <ScrollView
        style={styles_app.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles_app.screenTitle}>Estadísticas</Text>
        <Text style={styles_app.subtitle}>Resumen de gastos y ahorro</Text>

        <View style={statsStyles.filterRow}>
          {FILTROS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[statsStyles.filterChip, filtro === f.key && statsStyles.filterChipActive]}
              onPress={() => { setLoading(true); setFiltro(f.key); }}
            >
              <Text style={[statsStyles.filterText, filtro === f.key && statsStyles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {sinConexion && (
          <View style={statsStyles.errorBanner}>
            <Text style={statsStyles.errorBannerText}>
              no hay conexión a internet, vuelva más tarde
            </Text>
          </View>
        )}

        {loading && !sinConexion
          ? <ActivityIndicator style={{ marginTop: 20 }} />
          : !sinConexion && (
            <>
              <View style={dashStyles.totalCard}>
                <Text style={dashStyles.totalTitle}>Total Gastado</Text>
                <Text style={dashStyles.totalAmount}>
                  ${(data?.total_expenses ?? 0).toLocaleString('es-CL')}
                </Text>
                {data && data.total_income > 0 && (
                  <Text style={{ color: Colors.textoSuave, marginTop: 8, fontSize: 14 }}>
                    Ingresos: ${data.total_income.toLocaleString('es-CL')} · Ahorro: ${Math.max(data.balance, 0).toLocaleString('es-CL')}
                  </Text>
                )}
              </View>

              <View style={statsStyles.chartCard}>
                <Text style={statsStyles.chartTitle}>Gastos por categoría</Text>
                <GraficoTorta data={pieData} />
              </View>

              <View style={statsStyles.chartCard}>
                <Text style={statsStyles.chartTitle}>Gastos a lo largo del mes</Text>
                <GraficoLinea data={lineData} />
              </View>

              <Text style={styles_app.sectionTitle}>Detalle por categoría</Text>
              {data?.categories.length === 0
                ? <Text style={{ color: '#888', padding: 16 }}>Sin gastos registrados.</Text>
                : data?.categories.map((cat) => {
                  const porcentaje = (data.total_expenses ?? 0) > 0
                    ? (cat.total_amount / data.total_expenses) * 100
                    : 0;
                  const catAdapted = {
                    id: cat.category_id,
                    nombre: `${cat.category_icon} ${cat.category_name}`,
                    monto: cat.total_amount,
                    color: cat.category_color ?? '#D9EBFF',
                    gastos: [],
                  };
                  return (
                    <TarjetaCategoria
                      key={cat.category_id}
                      cat={catAdapted}
                      porcentaje={porcentaje}
                      estaAbierta={categoriaExpandida === cat.category_id}
                      alPresionar={() => toggleCategoria(cat.category_id)}
                    />
                  );
                })
              }

              <TouchableOpacity
                style={[styles_app.button, { marginTop: 20, backgroundColor: Colors.celeste }]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={[styles_app.buttonText, { color: Colors.azul }]}>+ Crear nueva categoría</Text>
              </TouchableOpacity>
            </>
          )
        }

        <View style={dashStyles.bottomPadding} />
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles_app.overlay}>
          <View style={styles_app.modalContainer}>
            <Text style={styles_app.modalTitle}>Nueva Categoría</Text>
            <TextInput
              style={styles_app.input}
              placeholder="Nombre (ej: Supermercado)"
              placeholderTextColor="#A0A0A0"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles_app.input}
              placeholder="Gasto mensual estimado (CLP)"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              value={newBudget}
              onChangeText={setNewBudget}
            />
            <TouchableOpacity style={styles_app.button} onPress={handleCreateCategory} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles_app.buttonText}>Guardar</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setModalVisible(false); setNewName(''); setNewBudget(''); }}
              style={styles_app.cancelButton}
            >
              <Text style={styles_app.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

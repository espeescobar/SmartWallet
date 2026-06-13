import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert, LayoutAnimation, UIManager, Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { styles as dashStyles } from '../styles/DashboardScreen.styles';
import { styles as statsStyles } from '../styles/Estadisticas.styles';
import { styles_app, Colors } from '../styles/App.styles';
import TarjetaCategoria from '../components/TarjetaCategoria';
import GraficoTorta from '../components/GraficoTorta';
import GraficoLinea from '../components/GraficoLinea';
import { api } from '../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  transaction_date?: string;
}

interface CategorySummary {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number;
  transaction_count: number;
  transactions?: Transaction[];
  budget_amount?: number;
}

interface DashboardData {
  total_income: number;
  total_expenses: number;
  balance: number;
  categories: CategorySummary[];
}

export type FiltroTemporal = 'semana' | 'mes' | 'trimestre' | 'anio';

const FILTROS: { key: FiltroTemporal; label: string }[] = [
  { key: 'semana', label: 'Semana Actual' },
  { key: 'mes', label: 'Mes Actual' },
  { key: 'trimestre', label: 'Últimos 3 meses' },
  { key: 'anio', label: 'Año' },
];

const CHART_COLORS = [Colors.azul, Colors.celeste, '#7ea4d9', Colors.textoSuave, '#4CAF50', '#FF9800'];
const EMOJI_LIST = ['🎯', '✈️', '💻', '🚗', '🏠', '📱', '🎓', '🎮', '👗', '🐶', '🏥', '🎉', '🎁', '🍔', '🛒', '🚲'];

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
  const [selectedEmoji, setSelectedEmoji] = useState('🎯'); 

  const load = useCallback(async () => {
    try {
      setSinConexion(false);
      const { from, to, month } = getDateRange(filtro);
      
      const [resSummary, resCats] = await Promise.all([
        api.get(`/dashboard/summary?month=${month}&from=${from}&to=${to}`).catch(() => ({ data: {} })),
        api.get('/dashboard/categories?type=expense').catch(() => ({ data: [] }))
      ]);

      const summaryData = resSummary.data || {};
      const allCategories = resCats.data || [];
      const summaryCategories = summaryData.categories || [];

      // 👇 EL SABUESO: Atrapamos el presupuesto y lo forzamos a número
      const mergedCategories = allCategories.map((cat: any) => {
        const existing = summaryCategories.find((c: any) => c.category_id === cat.id);
        const presupuestoReal = Number(cat.budget_amount) || Number(cat.budgetAmount) || 0;

        if (existing) {
          return { ...existing, budget_amount: presupuestoReal };
        }
        return {
          category_id: cat.id,
          category_name: cat.name,
          category_icon: cat.icon || '🏷️',
          category_color: cat.color || '#D9EBFF',
          total_amount: 0,
          transaction_count: 0,
          transactions: [],
          budget_amount: presupuestoReal
        };
      });

      setData({
        ...summaryData,
        total_income: summaryData.total_income || 0,
        total_expenses: summaryData.total_expenses || 0,
        balance: summaryData.balance || 0,
        categories: mergedCategories
      });
      
      setCategoriaExpandida(null); 
    } catch {
      setSinConexion(true);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filtro]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => { setRefreshing(true); load(); };

  const toggleCategoria = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
        icon: selectedEmoji,
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

  const pieData = (data?.categories ?? [])
    .filter(cat => cat.total_amount > 0) 
    .map((cat, i) => ({
      label: `${cat.category_icon} ${cat.category_name}`,
      value: cat.total_amount,
      color: cat.category_color || CHART_COLORS[i % CHART_COLORS.length],
    }));

  const allTransactions = useMemo(() => {
    if (!data || !data.categories) return [];
    let transactions: Transaction[] = [];
    data.categories.forEach(cat => {
      if (cat.transactions) {
        transactions = [...transactions, ...cat.transactions];
      }
    });
    return transactions;
  }, [data]);

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
              onPress={() => { 
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setLoading(true); 
                setFiltro(f.key); 
              }}
            >
              <Text style={[statsStyles.filterText, filtro === f.key && statsStyles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && !sinConexion ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={Colors.azul} />
        ) : (
          <>
            <View style={dashStyles.totalCard}>
              <Text style={dashStyles.totalTitle}>Total Gastado</Text>
              <Text style={dashStyles.totalAmount}>
                ${(data?.total_expenses ?? 0).toLocaleString('es-CL')}
              </Text>
            </View>

            {pieData.length > 0 && (
              <View style={statsStyles.chartCard}>
                <Text style={statsStyles.chartTitle}>Gastos por categoría</Text>
                <GraficoTorta data={pieData} />
              </View>
            )}
            {allTransactions.length > 0 && (
              <View style={statsStyles.chartCard}>
                <Text style={statsStyles.chartTitle}>Gastos a lo largo del periodo</Text>
                <GraficoLinea transactions={allTransactions} filtro={filtro} />
              </View>
            )}

            <Text style={styles_app.sectionTitle}>Detalle por categoría</Text>

            
            {data?.categories.length === 0
              ? <Text style={{ color: '#888', padding: 16 }}>Sin categorías registradas.</Text>
              : data?.categories.map((cat) => {
                
                const transaccionesAdaptadas = (cat.transactions || []).map((t) => {
                  const dateObj = new Date(t.date);
                  const dia = dateObj.getDate();
                  const mes = dateObj.toLocaleString('es-ES', { month: 'short' });
                  return {
                    id: t.id,
                    descripcion: t.description,
                    fechaReal: t.date,
                    fechaVisual: `${dia} ${mes.charAt(0).toUpperCase() + mes.slice(1)}`, 
                    monto: t.amount
                  };
                });

                const catAdapted = {
                  id: cat.category_id,
                  nombre: `${cat.category_icon} ${cat.category_name}`,
                  monto: cat.total_amount,
                  color: cat.category_color ?? '#D9EBFF',
                  gastos: transaccionesAdaptadas, 
                  presupuesto: Number(cat.budget_amount) || 0 
                };

                return (
                  <TarjetaCategoria
                    key={cat.category_id}
                    cat={catAdapted}
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
        )}
        <View style={dashStyles.bottomPadding} />
      </ScrollView>

      {/* Modal de Crear Categoría... (se mantiene igual, omitido por brevedad pero tu código lo tiene) */}
    </SafeAreaView>
  );
}
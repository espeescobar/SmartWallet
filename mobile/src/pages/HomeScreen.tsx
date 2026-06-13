import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { styles } from '../styles/HomeScreen.styles';
import { styles_app } from '../styles/App.styles';
import FormGastos from '../components/FormGastos';
import ProfileMenu from '../components/ProfileMenu';
import BudgetAlert from '../components/BudgetAlert';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  loadUserProfile, calcularPresupuestoTotal, evaluarPresupuesto,
  filtrarUltimaSemana, sumarGastos, BudgetStatus,
} from '../utils/budgetStatus';
import AlertaPresupuesto from '../components/AlertaPresupuesto';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  transaction_date: string;
  category_id?: string | null;
  category_name?: string | null;
  category_icon?: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return date.toLocaleDateString('es-CL', { weekday: 'short' });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const [txRes, dashRes, catRes, profile] = await Promise.all([
        api.get(`/transactions?type=expense&limit=100&month=${month}`),
        api.get(`/dashboard/summary?month=${month}`),
        api.get('/dashboard/categories?type=expense'),
        loadUserProfile(),
      ]);

      const semana = filtrarUltimaSemana(txRes.data as Transaction[]);
      setTransactions(semana);
      setCategories(catRes.data);
      
      const expenses = dashRes.data.total_expenses ?? 0;
      const income = dashRes.data.total_income ?? 0;

      const ahorroMensual = profile?.perfil?.objetivosAhorro ?? profile?.metas?.reduce((s, m) => s + m.montoMensual, 0) ?? 0;
      
      const saldoCalculado = 300000 - ahorroMensual - expenses - 40000;
      setSaldo(saldoCalculado);

      const presupuesto = calcularPresupuestoTotal(profile, user?.monthly_income ?? 0);
      setBudgetStatus(evaluarPresupuesto(expenses, income, presupuesto, ahorroMensual));
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.monthly_income]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleLogout = async () => {
    await logout();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
    );
  };

  const gastosSemana = useMemo(() => sumarGastos(transactions), [transactions]);

  const transaccionesFiltradas = useMemo(() => {
    if (!categoriaFiltro) return transactions;
    return transactions.filter((tx) => tx.category_id === categoriaFiltro);
  }, [transactions, categoriaFiltro]);

  const firstName = user?.full_name?.split(' ')[0] ?? 'tú';

  return (
    
    <SafeAreaView style={styles_app.safeArea}>
      <ScrollView
        style={styles_app.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
          </View>
          <ProfileMenu onLogout={handleLogout} />
        </View>

        {budgetStatus && <BudgetAlert status={budgetStatus} />}

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Saldo del mes:</Text>
          {loading
            ? <ActivityIndicator />
            : <Text style={styles.balanceAmount}>${saldo?.toLocaleString('es-CL')}</Text>
          }
        </View>
        <AlertaPresupuesto />

        <Text style={styles_app.sectionTitle}>Anotar un gasto</Text>
        <FormGastos onSaved={load} />

        <Text style={styles_app.sectionTitle}>Gastos recientes</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, !categoriaFiltro && styles.filterChipActive]}
            onPress={() => setCategoriaFiltro(null)}
          >
            <Text style={[styles.filterText, !categoriaFiltro && styles.filterTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, categoriaFiltro === cat.id && styles.filterChipActive]}
              onPress={() => setCategoriaFiltro(cat.id)}
            >
              <Text style={[styles.filterText, categoriaFiltro === cat.id && styles.filterTextActive]}>
                {cat.icon} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading
          ? <ActivityIndicator style={{ marginTop: 20 }} />
          : (
            <View style={styles.movementsContainer}>
            {transaccionesFiltradas.length === 0
              ? <Text style={styles.emptyText}>Sin gastos en la última semana{categoriaFiltro ? ' para esta categoría' : ''}.</Text>
              : transaccionesFiltradas.map((tx) => {
                
                // 1. Buscamos la categoría de este gasto en la lista que ya tenemos guardada en el Home
                const catDelGasto = categories.find(c => c.id === tx.category_id);
                
                // 2. Si el backend manda el ícono lo usamos, si no, usamos el de la categoría encontrada, o uno por defecto
                const icono = tx.category_icon || catDelGasto?.icon || '🏷️';
                
                // 3. Formateamos el título (Si no hay descripción, muestra el nombre de la categoría)
                const nombreCategoria = tx.category_name || catDelGasto?.name || 'Gasto';
                const tituloGasto = tx.description ? tx.description : nombreCategoria;

                return (
                  <View key={tx.id} style={styles.expenseItem}>
                    <View style={styles.expenseLeft}>
                      <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>{icono}</Text>
                      </View>
                      <View style={styles.expenseInfo}>
                        <Text style={styles.expenseDescription}>
                          {tituloGasto}
                        </Text>
                        <Text style={styles.expenseRelative}>{formatRelativeDate(tx.transaction_date)}</Text>
                        <Text style={styles.expenseDateTiny}>{formatFullDate(tx.transaction_date)}</Text>
                      </View>
                    </View>
                    <Text style={styles.expenseAmount}>
                      -${tx.amount.toLocaleString('es-CL')}
                    </Text>
                  </View>
                );
              })
            }
          </View>
          )
        }

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}
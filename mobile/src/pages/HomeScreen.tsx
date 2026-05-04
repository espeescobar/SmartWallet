import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { styles } from '../styles/HomeScreen.styles';
import { styles_app } from '../styles/App.styles';
import FormGastos from '../components/FormGastos';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  transaction_date: string;
  category_name?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [saldo, setSaldo]               = useState<number | null>(null);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const load = useCallback(async () => {
    try {
      const [txRes, dashRes] = await Promise.all([
        api.get('/transactions?limit=5'),
        api.get(`/dashboard/summary?month=${new Date().toISOString().slice(0, 7)}`),
      ]);
      setTransactions(txRes.data);
      setSaldo(dashRes.data.balance);
    } catch {
      // si falla dejamos los estados en null/vacío
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const firstName = user?.full_name?.split(' ')[0] ?? 'tú';

  return (
    <SafeAreaView style={styles_app.safeArea}>
      <ScrollView
        style={styles_app.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Tu plata</Text>
          {saldo === null
            ? <ActivityIndicator />
            : <Text style={styles.balanceAmount}>${saldo.toLocaleString('es-CL')}</Text>
          }
        </View>

        <Text style={styles_app.sectionTitle}>Anotar un gasto</Text>
        <FormGastos onSaved={load} />

        <Text style={styles_app.sectionTitle}>Movimientos recientes</Text>
        {loading
          ? <ActivityIndicator style={{ marginTop: 20 }} />
          : (
            <View style={styles.movementsContainer}>
              {transactions.length === 0
                ? <Text style={{ color: '#888', padding: 16 }}>Sin movimientos aún.</Text>
                : transactions.map((tx) => (
                  <View key={tx.id} style={styles.expenseItem}>
                    <View style={styles.expenseLeft}>
                      <View style={styles.iconCircle}>
                        <Text style={styles.iconText}></Text>
                      </View>
                      <View>
                        <Text style={styles.expenseDescription}>{tx.description}</Text>
                        <Text style={styles.expenseDate}>{formatDate(tx.transaction_date)}</Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.expenseAmount,
                      tx.type === 'income' && { color: '#22c55e' },
                    ]}>
                      {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('es-CL')}
                    </Text>
                  </View>
                ))
              }
            </View>
          )
        }

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

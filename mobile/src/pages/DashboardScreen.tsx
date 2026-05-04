import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const res = await api.get(`/dashboard/summary?month=${month}`);
      setData(res.data);
    } catch {
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

  const handleCreateCategory = async () => {
    if (!newName.trim()) {
      Alert.alert('Falta el nombre', 'Dale un nombre a tu nueva categoría.');
      return;
    }

    const parsedBudget = parseInt(newBudget, 10);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      Alert.alert('Monto inválido', 'Ingresa un gasto estimado válido.');
      return;
    }

    setSaving(true);
    try {
      // Ajusta esta ruta y payload según cómo esté configurado tu backend
      await api.post('/categories', {
        name: newName.trim(),
        type: 'expense',
        budget_amount: parsedBudget, // Enviamos el presupuesto estimado
        icon: '🏷️', // Icono por defecto (puedes hacer que el usuario lo elija luego)
        color: '#005AD6' // Color por defecto (azul)
      });
      
      setModalVisible(false);
      setNewName('');
      setNewBudget('');
      load(); // Recargamos el dashboard para mostrar la nueva categoría
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'No se pudo crear la categoría.');
    } finally {
      setSaving(false);
    }
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

        {/* Botón para crear nueva categoría */}
        {!loading && (
          <TouchableOpacity 
            style={[styles_app.button, { marginTop: 20, backgroundColor: '#D9EBFF' }]} 
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles_app.buttonText, { color: '#005AD6' }]}>+ Crear nueva categoría</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>


      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles_app.overlay}>
          <View style={styles_app.modalContainer}>
            <Text style={styles_app.modalTitle}>Nueva Categoría</Text>
            
            <TextInput
              style={styles_app.input}
              placeholder="Nombre (ej: Supermercado, Mascotas)"
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
              onPress={() => {
                setModalVisible(false);
                setNewName('');
                setNewBudget('');
              }} 
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
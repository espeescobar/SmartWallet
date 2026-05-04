import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, TextInput, Modal, View, StyleSheet } from 'react-native';
import Objetivos from '../components/Objetivos';
import { styles_app } from '../styles/App.styles';
import { api } from '../services/api';

interface Goal {
  id: string;
  title: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  status: string;
}

export default function ObjetivosScreen() {
  const [goals, setGoals]           = useState<Goal[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle]     = useState('');
  const [newAmount, setNewAmount]   = useState('');
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data.filter((g: Goal) => g.status === 'active'));
    } catch {
      // mantiene estado anterior
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Falta el nombre', 'Dale un nombre a tu objetivo.');
      return;
    }
    const parsed = parseInt(newAmount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto meta mayor a 0.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/goals', { title: newTitle.trim(), target_amount: parsed, icon: '🎯' });
      setModalVisible(false);
      setNewTitle('');
      setNewAmount('');
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'No se pudo crear el objetivo.');
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
        <Text style={styles_app.screenTitle}>Tus Objetivos de Ahorro</Text>
        <Text style={styles_app.subtitle}>Sigue ahorrando, vas súper bien</Text>

        {loading
          ? <ActivityIndicator style={{ marginTop: 20 }} />
          : goals.length === 0
            ? <Text style={{ color: '#888', padding: 16 }}>Aún no tienes objetivos. ¡Crea uno!</Text>
            : goals.map((obj) => (
              <Objetivos
                key={obj.id}
                title={`${obj.icon} ${obj.title}`}
                actual={obj.current_amount}
                total={obj.target_amount}
              />
            ))
        }

        <TouchableOpacity style={styles_app.button} onPress={() => setModalVisible(true)}>
          <Text style={styles_app.buttonText}>+ Crear nuevo objetivo</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={localStyles.overlay}>
          <View style={localStyles.modal}>
            <Text style={localStyles.title}>Nuevo objetivo</Text>
            <TextInput
              style={styles_app.input}
              placeholder="Nombre (ej: Viaje al sur)"
              placeholderTextColor="#A0A0A0"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles_app.input}
              placeholder="Meta en CLP (ej: 500000)"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              value={newAmount}
              onChangeText={setNewAmount}
            />
            <TouchableOpacity style={styles_app.button} onPress={handleCreate} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles_app.buttonText}>Guardar</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: '#888' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
});

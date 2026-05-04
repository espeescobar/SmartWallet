import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, TextInput, Modal, View } from 'react-native';
import Objetivos from '../components/Objetivos';
import { api } from '../services/api';

import { styles_app } from '../styles/App.styles';
import { styles_objetivos as styles } from '../styles/ObjetivosScreen.styles'; 

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
  
  // Ahora usamos un string simple para la fecha
  const [deadlineText, setDeadlineText] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState<string>(''); 

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

  // Efecto para calcular el monto mensual leyendo el texto DD/MM/AAAA
  useEffect(() => {
    const target = parseInt(newAmount, 10);
    const dateParts = deadlineText.split('/');
    
    // Solo calculamos si hay un monto válido y la fecha tiene 3 partes (DD, MM, AAAA)
    if (!isNaN(target) && target > 0 && dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Los meses en JS empiezan en 0
      const year = parseInt(dateParts[2], 10);
      
      const deadlineDate = new Date(year, month, day);
      
      // Verificamos que sea una fecha real
      if (!isNaN(deadlineDate.getTime())) {
        const now = new Date();
        
        let monthsDiff = (deadlineDate.getFullYear() - now.getFullYear()) * 12;
        monthsDiff -= now.getMonth();
        monthsDiff += deadlineDate.getMonth();

        const monthsToSave = monthsDiff <= 0 ? 1 : monthsDiff;
        const calculatedMonthly = Math.ceil(target / monthsToSave);
        
        setMonthlyAmount(calculatedMonthly.toString());
        return;
      }
    }
    
    // Si la fecha está incompleta o es inválida, limpiamos el monto mensual
    setMonthlyAmount('');
  }, [newAmount, deadlineText]);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Falta el nombre', 'Dale un nombre a tu objetivo.');
      return;
    }
  
    const parsedTarget = parseInt(newAmount, 10);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto meta mayor a 0.');
      return;
    }
  
    // Validación manual de la fecha
    const dateParts = deadlineText.split('/');
    if (dateParts.length !== 3) {
      Alert.alert('Fecha inválida', 'Ingresa la fecha en formato DD/MM/AAAA (ej: 31/12/2026).');
      return;
    }

    const deadlineDate = new Date(
      parseInt(dateParts[2], 10), 
      parseInt(dateParts[1], 10) - 1, 
      parseInt(dateParts[0], 10)
    );

    if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
      Alert.alert('Fecha inválida', 'Asegúrate de ingresar una fecha válida a futuro.');
      return;
    }
  
    const parsedMonthly = parseInt(monthlyAmount, 10);
    if (isNaN(parsedMonthly) || parsedMonthly <= 0) {
      Alert.alert('Ahorro mensual inválido', 'El monto de ahorro mensual debe ser mayor a 0.');
      return;
    }
  
    setSaving(true);
    try {
      await api.post('/goals', { 
        title: newTitle.trim(), 
        target_amount: parsedTarget, 
        deadline: deadlineDate.toISOString(),
        monthly_contribution: parsedMonthly
      });
      
      setModalVisible(false);
      setNewTitle('');
      setNewAmount('');
      setDeadlineText('');
      setMonthlyAmount('');
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
          ? <ActivityIndicator style={styles.loadingIndicator} />
          : goals.length === 0
            ? <Text style={styles.emptyText}>Aún no tienes objetivos. ¡Crea uno!</Text>
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
        <View style={styles_app.overlay}>
          <View style={styles_app.modalContainer}>
            <Text style={styles_app.modalTitle}>Nuevo objetivo</Text>
            
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

         
            <TextInput
              style={styles_app.input}
              placeholder="Fecha límite (ej: 31/12/2026)"
              placeholderTextColor="#A0A0A0"
              keyboardType="numbers-and-punctuation"
              value={deadlineText}
              onChangeText={setDeadlineText}
              maxLength={10} 
            />

            
                <Text style={styles.suggestionLabel}>
                  Ahorro mensual sugerido (puedes editarlo):
                </Text>
                <TextInput
                  style={styles_app.input}
                  placeholder="Monto mensual"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="numeric"
                  value={monthlyAmount}
                  onChangeText={setMonthlyAmount}
                />
             

            <TouchableOpacity style={styles_app.button} onPress={handleCreate} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles_app.buttonText}>Guardar</Text>
              }
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                setModalVisible(false);
                setDeadlineText(''); 
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
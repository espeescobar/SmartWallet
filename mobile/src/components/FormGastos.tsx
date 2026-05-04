import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { styles } from '../styles/FormGastos.styles';
import { styles_app } from '../styles/App.styles';
import { api } from '../services/api';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  onSaved?: () => void;
}

export default function FormGastos({ onSaved }: Props) {
  const [amount, setAmount]             = useState('');
  const [categoria, setCategoria]       = useState<Category | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [categories, setCategories]     = useState<Category[]>([]);

  useEffect(() => {
    api.get('/dashboard/categories?type=expense')
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error('Error al cargar categorías:', err?.response?.data || err.message);
      });
  }, []);

  const handleSubmit = async () => {
    if (!amount || !categoria) {
      Alert.alert('Ojo 👀', 'Falta el monto o seleccionar la categoría.');
      return;
    }
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a 0.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/transactions', {
        amount: parsed,
        type: 'expense',
        category_id: categoria.id,
        transaction_date: new Date().toISOString().slice(0, 10),
      });
      Alert.alert('¡Listo!', `Anotaste un gasto de $${parsed.toLocaleString('es-CL')} en ${categoria.name}`);
      setAmount('');
      setCategoria(null);
      onSaved?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'No se pudo guardar el gasto.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles_app.card}>
      <TextInput
        style={styles_app.input}
        placeholder="$0"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholderTextColor="#A1A1A8"
      />

      <TouchableOpacity style={styles.categorySelector} onPress={() => setModalVisible(true)}>
        <Text style={categoria ? styles.categoryTextFilled : styles.categoryTextPlaceholder}>
          {categoria ? `${categoria.icon} ${categoria.name}` : 'Elige en qué gastaste'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles_app.button} onPress={handleSubmit} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles_app.buttonText}>Guardar</Text>
        }
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿De qué es este gasto?</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { setCategoria(item); setModalVisible(false); }}
                >
                  <Text style={styles.modalItemText}>{item.icon} {item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

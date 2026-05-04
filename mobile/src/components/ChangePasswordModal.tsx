import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { styles_app, Colors } from '../styles/App.styles';
import { api } from '../services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Faltan datos', 'Completa todos los campos.');
      return;
    }
    if (next.length < 8 || !/[a-zA-Z]/.test(next) || !/[0-9]/.test(next)) {
      Alert.alert('Contraseña inválida', 'Debe tener al menos 8 caracteres, una letra y un número.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Contraseñas distintas', 'La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: current,
        new_password: next,
      });
      Alert.alert('Listo', 'Tu contraseña fue actualizada.');
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (err?.response?.status === 404 || err?.response?.status === 501) {
        Alert.alert(
          'No disponible',
          'El cambio de contraseña aún no está habilitado en el servidor.',
        );
      } else {
        Alert.alert('Error', msg ?? 'No se pudo cambiar la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles_app.overlay}>
        <View style={styles_app.modalContainer}>
          <Text style={styles_app.modalTitle}>Cambiar contraseña</Text>

          <Text style={styles_app.label}>Contraseña actual</Text>
          <TextInput
            style={styles_app.input}
            secureTextEntry
            value={current}
            onChangeText={setCurrent}
            placeholder="Contraseña actual"
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles_app.label}>Nueva contraseña</Text>
          <TextInput
            style={styles_app.input}
            secureTextEntry
            value={next}
            onChangeText={setNext}
            placeholder="Mín. 8 caracteres"
            placeholderTextColor="#A0A0A0"
          />

          <Text style={styles_app.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={styles_app.input}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite la nueva contraseña"
            placeholderTextColor="#A0A0A0"
          />

          <TouchableOpacity style={styles_app.button} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles_app.buttonText}>Guardar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={styles_app.cancelButton}>
            <Text style={styles_app.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

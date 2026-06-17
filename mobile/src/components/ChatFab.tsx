import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import ChatModal from './ChatModal';
import { Colors, Shadows } from '../styles/App.styles';

/**
 * Botón flotante global del chatbot. Se monta sobre los tabs (ver NavBar.tsx),
 * por lo que está disponible en todas las pantallas autenticadas.
 */
export default function ChatFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        accessibilityLabel="Abrir asistente financiero"
      >
        <Text style={styles.icon}>💬</Text>
      </TouchableOpacity>

      <ChatModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 86, // por encima de la barra de tabs (height 70)
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.azul,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.suave,
    zIndex: 100,
  },
  icon: { fontSize: 26 },
});

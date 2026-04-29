import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { styles } from '../styles/FormGastos.styles';
import { styles_app } from '../styles/App.styles';

const CATEGORIAS = [
    { id: '1', label: '🍔 Comida y Antojos' },
    { id: '2', label: '🚇 Transporte' },
    { id: '3', label: '🛒 Supermercado' },
    { id: '4', label: '🎉 Salidas y Carrete' },
    { id: '5', label: '💡 Cuentas fijas' },
];

export default function FormGastos() {
    const [amount, setAmount] = useState('');
    const [categoria, setCategoria] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleSubmit = () => {
        if (!amount || !categoria) {
            Alert.alert("Ojo 👀", "Falta el monto o seleccionar la categoría.");
            return;
        }
        Alert.alert("¡Listo!", `Anotaste un gasto de $${amount} en ${categoria}`);
        setAmount('');
        setCategoria('');
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
                    {categoria ? categoria : "Elige en qué gastaste"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles_app.button} onPress={handleSubmit}>
                <Text style={styles_app.buttonText}>Guardar</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>¿De qué es este gasto?</Text>
                        <FlatList
                            data={CATEGORIAS}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.modalItem}
                                    onPress={() => { setCategoria(item.label); setModalVisible(false); }}
                                >
                                    <Text style={styles.modalItemText}>{item.label}</Text>
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
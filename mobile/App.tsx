// SmartWallet/mobile/App.tsx
import React, { useState } from 'react';
import { Text, TextInput, Button, View, Alert } from 'react-native';
import axios from 'axios';
import { Expense } from '../shared/types';
// Aquí traemos tus estilos separados:
import { styles } from './App.styles';

export default function App() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async () => {
        const expenseData: Expense = {
            id: new Date().toISOString(),
            amount: parseFloat(amount),
            description: description,
            date: new Date().toISOString(),
        };

        try {
            // OJO: Recuerda cambiar <SERVER_URL> por localhost:3000 o tu IP local (ej: 192.168.x.x:3000)
            // y asegurarte de que la ruta coincida con tu backend (antes lo teníamos como /gastos)
            await axios.post('http://localhost:3000/gastos', expenseData);
            console.log('Gasto enviado con éxito');
            Alert.alert("Éxito", "Gasto enviado correctamente");
        } catch (error) {
            console.error('Error enviando el gasto:', error);
            Alert.alert("Error", "No se pudo enviar el gasto");
        }
    };

    return (
        <View style={styles.container}>
            <Text>Agregar Gasto</Text>
            <TextInput
                style={styles.input}
                placeholder="Monto"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
            <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={description}
                onChangeText={setDescription}
            />
            <Button title="Enviar Gasto" onPress={handleSubmit} />
        </View>
    );
}
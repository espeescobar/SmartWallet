import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { styles } from '../styles/HomeScreen.styles';
import FormGastos from '../components/FormGastos';
import { styles_app } from '../styles/App.styles';
import NavBar from '../components/NavBar';

export default function HomeScreen() {
    const saldoDisponible = 150000;
    const metaPrincipal = { title: '✈️ Viaje al sur', actual: 25000, total: 50000 };

    // Datos simulados de gastos
    const gastosRecientes = [
        { id: '1', description: '🍔 Burger King', amount: 8990, date: 'Hoy, 14:20' },
        { id: '2', description: '🚇 Metro de Santiago', amount: 810, date: 'Hoy, 08:15' },
        { id: '3', description: '🛒 Jumbo', amount: 24500, date: 'Ayer' },
    ];

    return (
        <SafeAreaView style={styles_app.safeArea}>
            <ScrollView style={styles_app.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hola, Diego 👋</Text>
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceTitle}>Tu plata</Text>
                    <Text style={styles.balanceAmount}>${saldoDisponible.toLocaleString('es-CL')}</Text>
                </View>

                <Text style={styles_app.sectionTitle}>Anotar un gasto</Text>
                <FormGastos />

        
                <Text style={styles_app.sectionTitle}>Movimientos recientes</Text>
                <View style={styles.movementsContainer}>
                    {gastosRecientes.map((gasto) => (
                        <View key={gasto.id} style={styles.expenseItem}>
                            <View style={styles.expenseLeft}>
                                <View style={styles.iconCircle}>
                                    <Text style={styles.iconText}></Text>
                                </View>
                                <View>
                                    <Text style={styles.expenseDescription}>{gasto.description}</Text>
                                    <Text style={styles.expenseDate}>{gasto.date}</Text>
                                </View>
                            </View>
                            <Text style={styles.expenseAmount}>-${gasto.amount.toLocaleString('es-CL')}</Text>
                        </View>
                    ))}
                </View>
                
                <View style={styles.bottomPadding} />
            </ScrollView>
        
        </SafeAreaView>
    );
}
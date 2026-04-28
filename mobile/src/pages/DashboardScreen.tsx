import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { styles } from '../styles/DashboardScreen.styles';

export default function DashboardScreen() {
    // Datos simulados del mes
    const gastosMes = 120000;
    
    // Categorías y colores característicos
    const resumenCategorias = [
        { id: '1', nombre: '🍔 Comida y Antojos', monto: 45000, color: '#FF3D71' }, // Rojo
        { id: '2', nombre: '🚇 Transporte', monto: 20000, color: '#3366FF' }, // Azul
        { id: '3', nombre: '🛒 Supermercado', monto: 55000, color: '#00E58D' }, // Verde Fintual
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.screenTitle}>Tus Gastos</Text>
                <Text style={styles.subtitle}>Resumen de este mes</Text>

                {/* Tarjeta principal con el total */}
                <View style={styles.totalCard}>
                    <Text style={styles.totalTitle}>Total Gastado</Text>
                    <Text style={styles.totalAmount}>${gastosMes.toLocaleString('es-CL')}</Text>
                </View>

                <Text style={styles.sectionTitle}>¿En qué se te fue la plata?</Text>
                
                {/* Lista de categorías con barra de porcentaje */}
                {resumenCategorias.map((cat) => {
                    // Calculamos qué porcentaje del total representa esta categoría
                    const porcentaje = (cat.monto / gastosMes) * 100;

                    return (
                        <View key={cat.id} style={styles.categoryContainer}>
                            <View style={styles.categoryHeader}>
                                <Text style={styles.categoryName}>{cat.nombre}</Text>
                                <Text style={styles.categoryAmount}>${cat.monto.toLocaleString('es-CL')}</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View 
                                    style={[
                                        styles.progressBarFill, 
                                        { width: `${porcentaje}%`, backgroundColor: cat.color }
                                    ]} 
                                />
                            </View>
                        </View>
                    );
                })}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { styles } from '../styles/DashboardScreen.styles';
import TarjetaCategoria from '../components/TarjetaCategoria'; // <-- Importamos el componente

export default function DashboardScreen() {
    const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);

    const gastosMes = 120000;
    
    const resumenCategorias = [
        { 
            id: '1', nombre: '🍔 Comida y Antojos', monto: 45000, color: '#D9EBFF',
            gastos: [
                { id: 'g1', descripcion: 'Burger King', fecha: '12 Abr', monto: 15000 },
                { id: 'g2', descripcion: 'Sushi Delivery', fecha: '08 Abr', monto: 30000 }
            ]
        },
        { 
            id: '2', nombre: '🚇 Transporte', monto: 20000, color: '#6E6E73',
            gastos: [
                { id: 'g3', descripcion: 'Carga Bip!', fecha: '10 Abr', monto: 10000 },
                { id: 'g4', descripcion: 'Uber a casa', fecha: '05 Abr', monto: 10000 }
            ]
        },
        { 
            id: '3', nombre: '🛒 Supermercado', monto: 55000, color: '#005AD6',
            gastos: [
                { id: 'g5', descripcion: 'Jumbo', fecha: '14 Abr', monto: 45000 },
                { id: 'g6', descripcion: 'Líder Express', fecha: '02 Abr', monto: 10000 }
            ]
        },
    ];

    const toggleCategoria = (id: string) => {
        setCategoriaExpandida(categoriaExpandida === id ? null : id);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                
                <Text style={styles.screenTitle}>Tus Gastos</Text>
                <Text style={styles.subtitle}>Resumen de este mes</Text>

                <View style={styles.totalCard}>
                    <Text style={styles.totalTitle}>Total Gastado</Text>
                    <Text style={styles.totalAmount}>${gastosMes.toLocaleString('es-CL')}</Text>
                </View>

                <Text style={styles.sectionTitle}>¿En qué se te fue la plata?</Text>
                
                {/* --- AQUÍ USAMOS EL COMPONENTE LIMPIO --- */}
                {resumenCategorias.map((cat) => {
                    const porcentaje = (cat.monto / gastosMes) * 100;
                    const estaAbierta = categoriaExpandida === cat.id;

                    return (
                        <TarjetaCategoria 
                            key={cat.id}
                            cat={cat}
                            porcentaje={porcentaje}
                            estaAbierta={estaAbierta}
                            alPresionar={() => toggleCategoria(cat.id)}
                        />
                    );
                })}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}
import React from 'react';
import { ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Objetivos from '../components/Objetivos';
import { styles } from '../styles/ObjetivosScreen.styles';

export default function ObjetivosScreen() {
    const misObjetivos = [
        { id: '1', title: '✈️ Viaje al sur', actual: 48000, total: 50000 },
        { id: '2', title: '💻 Macbook M3', actual: 150000, total: 1200000 },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.screenTitle}>Tus Objetivos</Text>
                <Text style={styles.subtitle}>Sigue ahorrando, vas súper bien</Text>
                
                {misObjetivos.map(obj => (
                    <Objetivos key={obj.id} title={obj.title} actual={obj.actual} total={obj.total} />
                ))}

                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Crear nuevo objetivo</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
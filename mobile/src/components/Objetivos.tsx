import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/Objetivos.styles';
import { styles_app } from '../styles/App.styles';

interface ObjetivosProps {
    title: string;
    actual: number;
    total: number;
}

export default function Objetivos({ title, actual, total }: ObjetivosProps) {
    const percent = Math.min(Math.round((actual / total) * 100), 100);

    const getProgressColor = () => {
        if (percent < 30) return '#6E6E73'; 
        if (percent < 80) return '#7ea4d9'; 
        return '#005AD6'; 
    };

    return (
        <View style={styles_app.card}>
            <View style={styles_app.rowBetween}>
                <Text style={styles.title}>{title}</Text>
                <Text style={[styles.percentage, { color: getProgressColor() }]}>{percent}%</Text>
            </View>
            <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: getProgressColor() }]} />
            </View>
            <View style={styles.footer}>
                <Text style={styles.amountText}>${actual.toLocaleString('es-CL')}</Text>
                <Text style={styles.amountText}>Meta: ${total.toLocaleString('es-CL')}</Text>
            </View>
        </View>
    );
}
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/DashboardScreen.styles'; // Importamos los mismos estilos

// Definimos la estructura de los datos que recibirá
interface Gasto {
    id: string;
    descripcion: string;
    fecha: string;
    monto: number;
}

interface TarjetaCategoriaProps {
    cat: {
        id: string;
        nombre: string;
        monto: number;
        color: string;
        gastos: Gasto[];
    };
    porcentaje: number;
    estaAbierta: boolean;
    alPresionar: () => void;
}

export default function TarjetaCategoria({ cat, porcentaje, estaAbierta, alPresionar }: TarjetaCategoriaProps) {
    return (
        <TouchableOpacity 
            style={styles.categoryContainer}
            activeOpacity={0.8}
            onPress={alPresionar}
        >
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

            {/* --- SECCIÓN DESPLEGABLE --- */}
            {estaAbierta && (
                <View style={styles.expandedList}>
                    {cat.gastos.map((gasto) => (
                        <View key={gasto.id} style={styles.gastoItem}>
                            <View>
                                <Text style={styles.gastoDescripcion}>{gasto.descripcion}</Text>
                                <Text style={styles.gastoFecha}>{gasto.fecha}</Text>
                            </View>
                            <Text style={styles.gastoMonto}>${gasto.monto.toLocaleString('es-CL')}</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
}
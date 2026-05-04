import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/DashboardScreen.styles'; 
import { Colors, styles_app } from '../styles/App.styles';

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
    
    // Función que determina el color dependiendo de qué tan grande sea el porcentaje
    const getBarColor = (percent: number) => {
        if (percent >= 75) return Colors.azul; 
        if (percent >= 40) return Colors.celeste; 
        if (percent >= 15) return Colors.textoSuave; 
        return Colors.textoSuave;
    };

    return (
        <TouchableOpacity 
            style={styles.categoryContainer}
            activeOpacity={0.8}
            onPress={alPresionar}
        >
            <View style={styles_app.rowBetween}>
                <Text style={styles.categoryName}>{cat.nombre}</Text>
                <Text style={styles.categoryAmount}>${cat.monto.toLocaleString('es-CL')}</Text>
            </View>
            
            <View style={styles.progressBarBg}>
                <View 
                    style={[
                        styles.progressBarFill, 
                        { 
                            width: `${porcentaje}%`, 
                            // Reemplazamos cat.color por nuestra función dinámica
                            backgroundColor: getBarColor(porcentaje) 
                        }
                    ]} 
                />
            </View>

            {estaAbierta && (
                <View style={styles.expandedList}>
                    {cat.gastos.map((gasto) => (
                        <View key={gasto.id} style={styles_app.rowBetween}>
                            <View>
                                <Text style={styles.gastoDescripcion}>{gasto.descripcion}</Text>
                                <Text style={styles.gastoFecha}>{gasto.fecha}</Text>
                            </View>
                            <Text style={styles.gastoDescripcion}>${gasto.monto.toLocaleString('es-CL')}</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
}
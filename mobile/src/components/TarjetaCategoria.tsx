import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/DashboardScreen.styles'; 
import { Colors, styles_app } from '../styles/App.styles';

interface Gasto {
    id: string;
    descripcion: string;
    fechaVisual: string;
    fechaReal: string;  
    monto: number;
}

interface TarjetaCategoriaProps {
    cat: {
        id: string;
        nombre: string;
        monto: number;
        color: string;
        gastos: Gasto[];
        presupuesto?: number;
    };
    estaAbierta: boolean;
    alPresionar: () => void;
}

export default function TarjetaCategoria({ cat, estaAbierta, alPresionar }: TarjetaCategoriaProps) {
    
    const tienePresupuesto = cat.presupuesto !== undefined && cat.presupuesto > 0;
    
    let porcentajeCalculado = 0;
    if (tienePresupuesto) {
        porcentajeCalculado = (cat.monto / cat.presupuesto!) * 100;
    }

    const porcentajeVisual = Math.min(porcentajeCalculado, 100);

    const getBarColor = (percent: number) => {
        if (!tienePresupuesto) return '#E0E0E0'; 
        if (percent >= 80) return '#FF3D71'; 
        if (percent >= 50) return Colors.azul; 
        if (percent >= 15) return Colors.celeste; 
        return '#A0C4FF'; 
    };

    return (
        <TouchableOpacity 
            style={styles.categoryContainer}
            activeOpacity={0.8}
            onPress={alPresionar}
        >
            <View style={styles_app.rowBetween}>
                <Text style={styles.categoryName}>{cat.nombre}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.categoryAmount}>${cat.monto.toLocaleString('es-CL')}</Text>
                    
                    {tienePresupuesto ? (
                        <Text style={{ fontSize: 12, color: Colors.textoSuave, marginTop: 2 }}>
                            {/* 👇 ¡Aquí mostramos el % explícitamente! */}
                            de ${cat.presupuesto!.toLocaleString('es-CL')} ({porcentajeCalculado.toFixed(1)}%)
                        </Text>
                    ) : (
                        <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                            Sin presupuesto definido
                        </Text>
                    )}
                </View>
            </View>
            
            <View style={styles.progressBarBg}>
                <View 
                    style={[
                        styles.progressBarFill, 
                        { 
                            width: tienePresupuesto ? `${porcentajeVisual}%` : '0%', 
                            backgroundColor: getBarColor(porcentajeCalculado) 
                        }
                    ]} 
                />
            </View>

            {tienePresupuesto && porcentajeCalculado >= 80 && (
                <Text style={{ color: '#FF3D71', fontSize: 12, marginTop: 6, fontWeight: '600' }}>
                    ⚠️ ¡Cuidado! Te acercas a tu límite mensual.
                </Text>
            )}

            {estaAbierta && (
                <View style={styles.expandedList}>
                    {cat.gastos.length > 0 ? (
                        cat.gastos.map((gasto) => (
                            <View key={gasto.id} style={[styles_app.rowBetween, { marginTop: 8 }]}>
                                <View>
                                    <Text style={styles.gastoDescripcion}>{gasto.descripcion}</Text>
                                    <Text style={styles.gastoFecha}>{gasto.fechaVisual}</Text>
                                </View>
                                <Text style={styles.gastoDescripcion}>${gasto.monto.toLocaleString('es-CL')}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ marginTop: 10, color: Colors.textoSuave, textAlign: 'center', fontStyle: 'italic' }}>
                            Sin gastos en este período.
                        </Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}
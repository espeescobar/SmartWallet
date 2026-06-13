import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
// 👇 Importamos tus estilos oficiales
import { Colors, Typography, Shadows } from '../styles/App.styles';

let alertaCerradaEnEstaSesion = false;

export default function AlertaPresupuesto() {
  const [categoriasEnPeligro, setCategoriasEnPeligro] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (alertaCerradaEnEstaSesion) return;

      const checkPresupuestos = async () => {
        try {
          const month = new Date().toISOString().slice(0, 7);
          const res = await api.get(`/dashboard/summary?month=${month}`);
          const categories = res.data?.categories || [];

          const enPeligro = categories.filter((cat: any) => {
            const presupuesto = Number(cat.budget_amount) || Number(cat.budget) || 0;
            const gastado = Number(cat.total_amount) || 0;
            return presupuesto > 0 && (gastado / presupuesto) >= 0.8;
          }).map((cat: any) => cat.category_name || cat.name);

          if (enPeligro.length > 0) {
            setCategoriasEnPeligro(enPeligro);
            setVisible(true);
          }
        } catch (error) {
          console.log("Error revisando alertas:", error);
        }
      };

      checkPresupuestos();
    }, [])
  );

  const cerrarAlerta = () => {
    alertaCerradaEnEstaSesion = true;
    setVisible(false);
  };

  if (!visible || categoriasEnPeligro.length === 0) return null;

  return (
    <View style={[{
      position: 'absolute',
      top: 20,
      left: 15,
      right: 15,
      zIndex: 9999,
      // 👇 Usamos tus variables de entorno
      backgroundColor: Colors.blanco,
      borderColor: Colors.error,
      borderWidth: 1.5,
      padding: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
    }, Shadows.suave]}> 
      {/* 👆 Le inyectamos tu sombra oficial */}
      
      <Text style={{ 
        flex: 1, 
        color: Colors.error, 
        fontSize: 14, 
        fontFamily: Typography.main, // 👈 Tu tipografía oficial
        fontWeight: '700', 
        lineHeight: 20 
      }}>
        ⚠️ ¡Atención! Estás superando el 80% de tu límite en: {categoriasEnPeligro.join(', ')}.
      </Text>
      
      <TouchableOpacity onPress={cerrarAlerta} style={{ paddingLeft: 12, paddingVertical: 8 }}>
        <Text style={{ 
          color: Colors.textoSuave, // 👈 La "X" en tu gris suave
          fontWeight: 'bold', 
          fontSize: 18,
          fontFamily: Typography.main
        }}>
          ✕
        </Text>
      </TouchableOpacity>
    </View>
  );
}
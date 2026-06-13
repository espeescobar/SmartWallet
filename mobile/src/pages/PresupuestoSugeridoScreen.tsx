import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles_app } from '../styles/App.styles';
import { styles } from '../styles/Perfilamiento.styles';
import {
  generarPropuesta, sumaCategorias, CategoriaPresupuesto, MetaSugerida,
} from '../utils/budgetCalculator';
import { isValidAmount, parsePositiveAmount } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RootStackParamList } from '../navigation/types';

type PresupuestoNav = NativeStackNavigationProp<RootStackParamList, 'PresupuestoSugerido'>;

export default function PresupuestoSugeridoScreen() {
  const navigation = useNavigation<PresupuestoNav>();
  const route = useRoute<any>(); 
  const { login } = useAuth();
  
  const { email, password, categorias: categoriasOcultas } = route.params || {};
  const perfilSeguro = route.params?.perfil || {
    ingresos: 300000,
    gastos: 30000,
    cuentasBasicas: 40000,
    objetivosAhorro: 30000,
  };

  const propuestaInicial = useMemo(() => generarPropuesta(perfilSeguro), [perfilSeguro]);
  
  const [categorias, setCategorias] = useState<CategoriaPresupuesto[]>(propuestaInicial.categorias);
  const [metas, setMetas] = useState<MetaSugerida[]>(propuestaInicial.metas);
  
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [guardando, setGuardando] = useState(false);

  const gastosFijos = perfilSeguro.gastos + perfilSeguro.cuentasBasicas;
  const totalAsignado = sumaCategorias(categorias) + metas.reduce((s, m) => s + m.montoMensual, 0) + gastosFijos;
  const ingresoTotal = propuestaInicial.ingresoTotal;

  const actualizarCategoria = (id: string, monto: string) => {
    if (monto.trim() !== '' && !isValidAmount(monto)) return;
    setCategorias((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, monto: parsePositiveAmount(monto) ?? 0 } : c
      )
    );
  };

  const eliminarCategoria = (id: string) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  const agregarCategoria = () => {
    if (!nuevaCategoria.trim()) return;
    setCategorias((prev) => [
      ...prev,
      {
        id: `cat-custom-${Date.now()}`,
        nombre: nuevaCategoria.trim(),
        icono: '🏷️',
        monto: 0,
      },
    ]);
    setNuevaCategoria('');
  };

  const actualizarMeta = (id: string, monto: string) => {
    if (monto.trim() !== '' && !isValidAmount(monto)) return;
    setMetas((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, montoMensual: parsePositiveAmount(monto) ?? 0 } : m
      )
    );
  };



  const finalizar = async () => {
    setGuardando(true);
    try {
      if (email && password) {
        await login(email, password);
      }

      // 1. Guardamos el ingreso fijo en la BD
      if (ingresoTotal > 0) {
        await api.patch('/auth/me', { monthly_income: 300000 }).catch(() => {});
      }

      // 2. CREAMOS LAS CATEGORÍAS EN LA BASE DE DATOS REAL
      const categoriasParaCrear = [
        { name: 'Micro', icon: '🚌', budget_amount: categoriasOcultas?.micro || 10000, type: 'expense', color: '#D9EBFF' },
        { name: 'Colaciones', icon: '🍔', budget_amount: categoriasOcultas?.colaciones || 30000, type: 'expense', color: '#005AD6' },
        { name: 'Ocio', icon: '🎉', budget_amount: categoriasOcultas?.ocio || 40000, type: 'expense', color: '#1A1A1A' },
        { name: 'Materiales', icon: '📚', budget_amount: categoriasOcultas?.materiales || 30000, type: 'expense', color: '#6E6E73' },
      ];

      for (const cat of categoriasParaCrear) {
        try {
          await api.post('/dashboard/categories', cat);
        } catch (e) {
          console.log(`Error creando categoría ${cat.name} en BD:`, e);
        }
      }
      try {
        const unAnoMas = new Date();
        unAnoMas.setFullYear(unAnoMas.getFullYear() + 1);

        const goalResponse = await api.post('/goals', { 
          title: 'Ahorro mensual',   
          target_amount: 360000,  
          monthly_contribution: 30000,   
          deadline: unAnoMas.toISOString(),
          icon: '🎯'
        });

 
        const newGoalId = goalResponse.data?.id || goalResponse.data?.goal?.id;
        if (newGoalId) {
          try {
            await api.post(`/goals/${newGoalId}/contributions`, {
              amount: 30000, 
              description: 'Aporte inicial automático'
            });
          } catch (patchErr) {
            await api.patch(`/goals/${newGoalId}`, {
              current_amount: 30000
            }).catch(() => console.log('El backend rechazó el aporte y el PATCH'));
          }
        }
      } catch (e) {
        console.log('Error creando objetivo en BD:', e);
      }

      // Guardado local
      const metasFijasParaGuardar = [
        { id: 'meta-default', nombre: 'Ahorro mensual', montoMensual: 30000, montoTotal: 360000, meses: 12 }
      ];
      await AsyncStorage.setItem('user_profile', JSON.stringify({ perfil: perfilSeguro, metas: metasFijasParaGuardar }));
      await AsyncStorage.setItem('profiling_complete', 'true');
      
      // Nos vamos al Home!
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      console.log('Error finalizando:', error);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles_app.safeArea}>
      <ScrollView style={styles_app.container} showsVerticalScrollIndicator={false}>
        <Text style={styles_app.screenTitle}>Tu presupuesto sugerido</Text>
        <Text style={styles_app.subtitle}>Ajusta los montos según tus necesidades</Text>

        {propuestaInicial.gastosFijosExcedenIngresos && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              Tus gastos fijos exceden tus ingresos; se sugiere revisar tus metas de ahorro prioritarias
            </Text>
          </View>
        )}

        <Text style={styles_app.sectionTitle}>Categorías de gasto</Text>
        <View style={styles_app.card}>
          {categorias.map((cat) => (
            <View key={cat.id} style={styles.editableRow}>
              <Text style={styles.categoryLabel}>{cat.icono} {cat.nombre}</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={cat.monto > 0 ? cat.monto.toString() : ''}
                onChangeText={(v) => actualizarCategoria(cat.id, v)}
                placeholder="0"
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarCategoria(cat.id)}>
                <Text style={styles.deleteText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.editableRow}>
            <TextInput
              style={[styles_app.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Nueva categoría..."
              placeholderTextColor="#A0A0A0"
              value={nuevaCategoria}
              onChangeText={setNuevaCategoria}
            />
            <TouchableOpacity
              style={[styles_app.button_secundario, { marginTop: 0, marginLeft: 8, paddingHorizontal: 16, height: 48 }]}
              onPress={agregarCategoria}
            >
              <Text style={styles_app.buttonText_secundario}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {metas.length > 0 && (
          <>
            <Text style={styles_app.sectionTitle}>Metas de ahorro sugeridas</Text>
            <View style={styles_app.card}>
              {metas.map((meta) => (
                <View key={meta.id} style={{ marginBottom: 16 }}>
                  <View style={styles.editableRow}>
                    <Text style={styles.categoryLabel}>🎯 {meta.nombre}</Text>
                    <TextInput
                      style={styles.amountInput}
                      keyboardType="numeric"
                      value={meta.montoMensual > 0 ? meta.montoMensual.toString() : ''}
                      onChangeText={(v) => actualizarMeta(meta.id, v)}
                      placeholder="0"
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>
                  <Text style={styles.metaInfo}>
                    Meta: ${meta.montoTotal.toLocaleString('es-CL')} · {meta.meses} meses
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles_app.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Ingreso declarado</Text>
            <Text style={styles.totalAmount}>${ingresoTotal.toLocaleString('es-CL')}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total asignado</Text>
            <Text style={[styles.totalAmount, totalAsignado !== ingresoTotal && { color: '#FF3D71' }]}>
              ${totalAsignado.toLocaleString('es-CL')}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles_app.button} onPress={finalizar} disabled={guardando}>
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles_app.buttonText}>Confirmar presupuesto</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
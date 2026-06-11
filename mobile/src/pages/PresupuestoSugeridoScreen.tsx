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
  const route = useRoute<RouteProp<RootStackParamList, 'PresupuestoSugerido'>>();
  const { login } = useAuth();
  const { perfil, email, password } = route.params;

  const propuestaInicial = useMemo(() => generarPropuesta(perfil), [perfil]);
  const [categorias, setCategorias] = useState<CategoriaPresupuesto[]>(propuestaInicial.categorias);
  const [metas, setMetas] = useState<MetaSugerida[]>(propuestaInicial.metas);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [guardando, setGuardando] = useState(false);

  const gastosFijos = perfil.gastos + perfil.cuentasBasicas;
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

  const confirmarPresupuesto = () => {
    if (ingresoTotal > 0 && totalAsignado !== ingresoTotal) {
      Alert.alert(
        'Total no coincide',
        'El total asignado no coincide con tu ingreso, ¿deseas continuar de todas formas?',
        [
          { text: 'Revisar', style: 'cancel' },
          { text: 'Continuar', onPress: finalizar },
        ]
      );
    } else {
      finalizar();
    }
  };

  const finalizar = async () => {
    setGuardando(true);
    
    try {
      console.log("1. Iniciando sesión con la cuenta ya creada...");
      await login(email, password); 

      console.log("2. Guardando presupuesto, categorías y metas...");
      // ¡AQUÍ ESTÁ LA CLAVE! Usamos PATCH /auth/me en lugar de register
      await api.patch('/auth/me', {
        monthly_income: ingresoTotal, 
        categorias: categorias.map(c => ({ nombre: c.nombre, icono: c.icono, monto: c.monto })),
        metas: metas.map(m => ({ nombre: m.nombre, montoTotal: m.montoTotal, montoMensual: m.montoMensual }))
      });

      console.log("3. Todo guardado. Viajando al Dashboard...");
      await AsyncStorage.setItem('profiling_complete', 'true');
      await AsyncStorage.setItem('user_profile', JSON.stringify({ perfil, categorias, metas }));
      
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });

    } catch (error: any) {
      console.error("❌ Error en finalizar:", error.response?.data || error.message);
      Alert.alert("Error", "Hubo un problema al guardar tu presupuesto.");
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
            <Text style={[styles.totalAmount, totalAsignado !== ingresoTotal && { color: '#E65100' }]}>
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

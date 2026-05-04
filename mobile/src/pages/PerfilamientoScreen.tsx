import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles_app } from '../styles/App.styles';
import { styles } from '../styles/Perfilamiento.styles';
import { isValidAmount, parsePositiveAmount } from '../utils/validation';
import { PerfilFinanciero } from '../utils/budgetCalculator';
import { RootStackParamList } from '../navigation/types';

type PerfilNav = NativeStackNavigationProp<RootStackParamList, 'Perfilamiento'>;

const PASOS = [
  {
    titulo: 'Ingresos líquidos',
    descripcion: '¿Cuánto ganas al mes después de descuentos?',
    campo: 'ingresos' as const,
    placeholder: 'Ej: 800000',
  },
  {
    titulo: 'Gastos fijos',
    descripcion: 'Arriendo, servicios básicos y otros gastos recurrentes.',
    campo: 'gastos' as const,
    placeholder: 'Ej: 350000',
  },
  {
    titulo: 'Cuentas básicas',
    descripcion: 'Agua, luz, gas, internet y otros servicios esenciales.',
    campo: 'cuentasBasicas' as const,
    placeholder: 'Ej: 80000',
  },
  {
    titulo: 'Objetivos de ahorro',
    descripcion: '¿Cuánto te gustaría ahorrar cada mes?',
    campo: 'objetivosAhorro' as const,
    placeholder: 'Ej: 100000',
  },
];

export default function PerfilamientoScreen() {
  const navigation = useNavigation<PerfilNav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Perfilamiento'>>();
  const [paso, setPaso] = useState(0);
  const [valores, setValores] = useState<Record<string, string>>({
    ingresos: '',
    gastos: '',
    cuentasBasicas: '',
    objetivosAhorro: '',
  });
  const [error, setError] = useState('');

  const pasoActual = PASOS[paso];
  const valorActual = valores[pasoActual.campo];

  const avanzar = (omitir = false) => {
    if (!omitir && valorActual.trim() !== '') {
      if (!isValidAmount(valorActual)) {
        setError('Ingresa un monto válido');
        return;
      }
    }
    setError('');

    if (paso < PASOS.length - 1) {
      setPaso(paso + 1);
    } else {
      const perfil: PerfilFinanciero = {
        ingresos: parsePositiveAmount(valores.ingresos) ?? 0,
        gastos: parsePositiveAmount(valores.gastos) ?? 0,
        cuentasBasicas: parsePositiveAmount(valores.cuentasBasicas) ?? 0,
        objetivosAhorro: parsePositiveAmount(valores.objetivosAhorro) ?? 0,
      };
      navigation.navigate('PresupuestoSugerido', {
        perfil,
        email: route.params?.email,
        password: route.params?.password,
      });
    }
  };

  const actualizarValor = (texto: string) => {
    setValores({ ...valores, [pasoActual.campo]: texto });
    if (error) setError('');
  };

  return (
    <SafeAreaView style={styles_app.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles_app.container} keyboardShouldPersistTaps="handled">
          <Text style={styles_app.screenTitle}>Configura tu perfil</Text>
          <Text style={styles_app.subtitle}>Paso {paso + 1} de {PASOS.length}</Text>

          <View style={styles.progressContainer}>
            {PASOS.map((_, i) => (
              <View
                key={i}
                style={[styles.progressDot, i <= paso && styles.progressDotActive]}
              />
            ))}
          </View>

          <View style={styles_app.card}>
            <Text style={styles.stepTitle}>{pasoActual.titulo}</Text>
            <Text style={styles.stepDescription}>{pasoActual.descripcion}</Text>

            <Text style={styles_app.label}>Monto en CLP</Text>
            <TextInput
              style={styles_app.input}
              placeholder={pasoActual.placeholder}
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
              value={valorActual}
              onChangeText={actualizarValor}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles_app.button} onPress={() => avanzar(false)}>
              <Text style={styles_app.buttonText}>
                {paso < PASOS.length - 1 ? 'Continuar' : 'Ver propuesta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={() => avanzar(true)}>
              <Text style={styles.skipText}>Omitir este paso</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

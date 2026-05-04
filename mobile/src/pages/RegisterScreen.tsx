import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles_app } from '../styles/App.styles';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function RegisterScreen() {
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [income, setIncome]       = useState('');
  const [loading, setLoading]     = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Faltan datos', 'Completa todos los campos obligatorios.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Contraseñas distintas', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      Alert.alert('Contraseña inválida', 'Debe tener al menos 8 caracteres, una letra y un número.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name:      fullName.trim(),
        email:          email.trim(),
        password,
        monthly_income: income ? parseInt(income, 10) : 0,
      });
      // Login automático después del registro
      await login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'No se pudo crear la cuenta.';
      Alert.alert('Error al registrarse', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={localStyles.container}>
      <ScrollView contentContainerStyle={localStyles.scroll} keyboardShouldPersistTaps="handled">
        <Image
          source={require('../../assets/logo.png')}
          style={localStyles.logo}
          resizeMode="contain"
        />

        <Text style={localStyles.title}>Crea tu cuenta</Text>

        <TextInput
          style={styles_app.input}
          placeholder="Nombre completo"
          placeholderTextColor="#A0A0A0"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles_app.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles_app.input}
          placeholder="Contraseña (mín. 8 chars, 1 letra y 1 número)"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles_app.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#A0A0A0"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />
        <TextInput
          style={styles_app.input}
          placeholder="Ingreso mensual en CLP (opcional)"
          placeholderTextColor="#A0A0A0"
          value={income}
          onChangeText={setIncome}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles_app.button} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles_app.buttonText}>Crear cuenta</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.link}>
          <Text style={localStyles.linkText}>¿Ya tienes cuenta? <Text style={localStyles.linkBold}>Inicia sesión</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logo: {
    width: 200,
    height: 100,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1A1A1A',
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#888',
    fontSize: 14,
  },
  linkBold: {
    color: '#005AD6',
    fontWeight: '700',
  },
});

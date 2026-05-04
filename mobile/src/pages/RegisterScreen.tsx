import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles_app, Colors } from '../styles/App.styles';
import { api } from '../services/api';
import { isValidEmail } from '../utils/validation';
import { RootStackParamList } from '../navigation/types';

type RegisterNav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigation = useNavigation<RegisterNav>();

  const handleRegister = async () => {
    setEmailError('');

    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Faltan datos', 'Completa todos los campos.');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Correo inválido');
      return;
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      Alert.alert('Contraseña inválida', 'Debe tener al menos 8 caracteres, una letra y un número.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        monthly_income: 0,
      });
      navigation.navigate('Perfilamiento', {
        email: email.trim(),
        password,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error ?? '';
      if (status === 409 || msg.toLowerCase().includes('registrado') || msg.toLowerCase().includes('exists')) {
        setEmailError('Correo ya registrado');
      } else if (!isValidEmail(email)) {
        setEmailError('Correo inválido');
      } else {
        Alert.alert('Error al registrarse', msg || 'No se pudo crear la cuenta.');
      }
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

        <Text style={styles_app.label}>Nombre</Text>
        <TextInput
          style={styles_app.input}
          placeholder="Tu nombre"
          placeholderTextColor="#A0A0A0"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <Text style={styles_app.label}>Email</Text>
        <TextInput
          style={[styles_app.input, emailError ? { borderColor: Colors.error } : null]}
          placeholder="Correo electrónico"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={localStyles.errorText}>{emailError}</Text> : null}

        <Text style={styles_app.label}>Contraseña</Text>
        <TextInput
          style={styles_app.input}
          placeholder="Mín. 8 caracteres, 1 letra y 1 número"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles_app.button} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles_app.buttonText}>Registrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.link}>
          <Text style={localStyles.linkText}>
            ¿Ya tienes cuenta? <Text style={localStyles.linkBold}>Inicia sesión</Text>
          </Text>
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
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: -8,
    marginBottom: 8,
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

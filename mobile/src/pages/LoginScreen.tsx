import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles_app } from '../styles/App.styles';
import { useAuth } from '../context/AuthContext';


export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'No se pudo conectar con el servidor.';
      Alert.alert('Error al ingresar', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={localStyles.fixedContainer}>
      <View style={localStyles.centerContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={localStyles.logo}
          resizeMode="contain"
        />

        <View style={localStyles.formContainer}>
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
            placeholder="Contraseña"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles_app.button} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles_app.buttonText}>Iniciar Sesión</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register' as never)}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ color: '#888', fontSize: 14 }}>
              ¿No tienes cuenta?{' '}
              <Text style={{ color: '#005AD6', fontWeight: '700' }}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  fixedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 120,
  },
  logo: {
    width: 400,
    height: 200,
    alignSelf: 'center',
  },
  formContainer: {
    paddingHorizontal: 40,
    width: '100%',
  },
});

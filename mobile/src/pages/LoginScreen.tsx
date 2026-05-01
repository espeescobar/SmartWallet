import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native'; 
import { useNavigation } from '@react-navigation/native';
import { styles_app } from '../styles/App.styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate('MainTabs');
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

          <TouchableOpacity style={styles_app.button} onPress={handleLogin}>
              <Text style={styles_app.buttonText}>Iniciar Sesión</Text>
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
    marginBottom: 120 
  },
  logo: {
    width: 400,
    height: 200,
    alignSelf: 'center',
  },
  formContainer: {
    paddingHorizontal: 40, 
    width: '100%',
  }
});
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';
import HomeScreen from '../pages/HomeScreen';
import DashboardScreen from '../pages/DashboardScreen';
import ObjetivosScreen from '../pages/ObjetivosScreen';
import { Colors, Typography } from '../styles/App.styles';

const Tab = createBottomTabNavigator();

export default function NavBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.negro,
        tabBarInactiveTintColor: Colors.textoSuave,
        tabBarStyle: {
          backgroundColor: Colors.blanco,
          height: 70,
          paddingBottom: 10,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          fontFamily: Typography.main,
        },
        
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === 'Inicio') {
            iconSource = focused 
              ? require('../../assets/home.png') 
              : require('../../assets/home_inactivo.png');
          } else if (route.name === 'Objetivos') {
            
            iconSource = focused 
              ? require('../../assets/objetivos.png') 
              : require('../../assets/objetivos_inactivo.png');
          } else if (route.name === 'Analíticas') {
            iconSource = focused 
              ? require('../../assets/analitica.png') 
              : require('../../assets/analitica_inactivo.png');
          }

          return (
            <Image 
              source={iconSource} 
              style={{ width: 24, height: 24 }} 
              resizeMode="contain" 
            />
          );
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Objetivos" component={ObjetivosScreen} />
      <Tab.Screen name="Analíticas" component={DashboardScreen} />
    </Tab.Navigator>
  );
}
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../pages/HomeScreen';
import DashboardScreen from '../pages/DashboardScreen';
import ObjetivosScreen from '../pages/ObjetivosScreen';
import { Colors, Typography } from '../styles/App.styles';

const Tab = createBottomTabNavigator();

export default function NavBar() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor: Colors.negro, 

          tabBarInactiveTintColor: Colors.textoSuave, 
          tabBarStyle: { 
            backgroundColor: Colors.blanco, 
            height: 70, 
            paddingTop: 20,
            borderTopWidth: 1, 
          },

          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '600',
            fontFamily: Typography.main
          },

          tabBarIconStyle: { display: 'none' },
          tabBarItemStyle: { justifyContent: 'center' } 
        }}
      >
        
        <Tab.Screen 
          name="Inicio" 
          component={HomeScreen} 
          options={{ tabBarLabel: 'Inicio' }} 
        />
        <Tab.Screen 
          name="Objetivos" 
          component={ObjetivosScreen} 
          options={{ tabBarLabel: 'Objetivos' }} 
        />
        <Tab.Screen 
          name="DashboardScreen" 
          component={DashboardScreen} 
          options={{ tabBarLabel: 'Analíticas' }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
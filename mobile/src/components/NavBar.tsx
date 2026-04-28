import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../pages/HomeScreen';
import DashboardScreen from '../pages/DashboardScreen';
import ObjetivosScreen from '../pages/ObjetivosScreen';

const Tab = createBottomTabNavigator();

export default function NavBar() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor: '#FFFFFF', 

          tabBarInactiveTintColor: '#8E8E93', 
          tabBarStyle: { 
            backgroundColor: '#1A1A1A', 
            height: 80, 
            paddingBottom: 0, 
            paddingTop: 0,
            borderTopWidth: 0, 
            elevation: 0 
          },

          tabBarLabelStyle: {
            fontSize: 15,
            fontWeight: '600'
          }
        }}
      >
        
        <Tab.Screen 
          name="Objetivos" 
          component={ObjetivosScreen} 
          options={{ tabBarLabel: 'Objetivos' }} 
        />
        <Tab.Screen 
          name="Inicio" 
          component={HomeScreen} 
          options={{ tabBarLabel: 'Inicio' }} 
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
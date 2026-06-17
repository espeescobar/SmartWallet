import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View } from 'react-native';
import HomeScreen from '../pages/HomeScreen';
import DashboardScreen from '../pages/DashboardScreen';
import ObjetivosScreen from '../pages/ObjetivosScreen';
import AprendeScreen from '../pages/AprendeScreen';
import ChatFab from './ChatFab';
import { Colors, Typography } from '../styles/App.styles';
import { MainTabParamList } from '../navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function NavBar() {
  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      id="MainTabs"
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
          fontSize: 11,
          fontWeight: '600',
          fontFamily: Typography.main,
        },
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Aprende') {
            return (
              <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>📖</Text>
            );
          }

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
      <Tab.Screen name="Aprende" component={AprendeScreen} />
    </Tab.Navigator>
    <ChatFab />
    </View>
  );
}

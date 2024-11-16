import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddTripScreen from '../screens/AddTripScreen';
import TripDetailsScreen from '../screens/TripDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../config';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: { 
        paddingBottom: 5,
        height: 60,
        backgroundColor: COLORS.surface,
        borderTopColor: '#e5e7eb',
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: '#9ca3af',
      headerStyle: {
        backgroundColor: COLORS.surface,
      },
      headerTintColor: COLORS.text,
    }}
  >
    <Tab.Screen
      name="Trips"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="bag-suitcase" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Add Trip"
      component={AddTripScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      }}
    >
      {token ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TripDetails"
            component={TripDetailsScreen}
            options={{ title: 'Trip Details' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SettingScreen from '../screens/SettingScreen'; // Thêm dòng này
import AddServiceScreen from '../screens/AddServiceScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import EditServiceScreen from '../screens/EditServiceScreen';
import TransactionScreen from '../screens/TransactionScreen';
import CustomerScreen from '../screens/CustomerScreen';


// ...giữ nguyên các phần khác...

// ...imports giữ nguyên...

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack cho tab Home
function HomeStackNavigator() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AddService" component={AddServiceScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="EditService" component={EditServiceScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E84C6C',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff', height: 60, paddingBottom: 6 },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Ionicons name="home" size={size} color={color} />;
          if (route.name === 'Transaction') return <MaterialIcons name="receipt-long" size={size} color={color} />;
          if (route.name === 'Customer') return <Ionicons name="people-outline" size={size} color={color} />;
          if (route.name === 'Setting') return <Ionicons name="settings-outline" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Transaction" component={TransactionScreen} options={{ tabBarLabel: 'Transaction' }} />
      <Tab.Screen name="Customer" component={CustomerScreen} options={{ tabBarLabel: 'Customer' }} />
      <Tab.Screen name="Setting" component={SettingScreen} options={{ tabBarLabel: 'Setting' }} />
    </Tab.Navigator>
  );
}

const RootNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {user ? (
        <MainTabNavigator />
      ) : (
        <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
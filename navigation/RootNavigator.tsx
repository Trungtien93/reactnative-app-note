import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import TaskListScreen from '../screens/TaskListScreen'; // Đổi tên HomeScreen thành TaskListScreen nếu cần
import TaskEditScreen from '../screens/TaskEditScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import { AuthContext } from '../context/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SettingScreen from '../screens/SettingScreen';
import TransactionScreen from '../screens/TransactionScreen';
import CustomerScreen from '../screens/CustomerScreen';
import CalendarScreen from '../screens/CalendarScreen';
import StatsScreen from '../screens/StatsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack cho tab Tasks
function TaskStackNavigator() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="TaskEdit" component={TaskEditScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack cho tab Calendar
function CalendarStackNavigator() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="TaskEdit" component={TaskEditScreen} />
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
          if (route.name === 'Tasks') return <Ionicons name="list" size={size} color={color} />;
          if (route.name === 'Transaction') return <MaterialIcons name="receipt-long" size={size} color={color} />;
          if (route.name === 'Customer') return <Ionicons name="people-outline" size={size} color={color} />;
          if (route.name === 'Setting') return <Ionicons name="settings-outline" size={size} color={color} />;
          if (route.name === 'Calendar') return <Ionicons name="calendar-outline" size={size} color={color} />;
          if (route.name === 'Stats') return <Ionicons name="bar-chart" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tasks" component={TaskStackNavigator} options={{ tabBarLabel: 'Công việc' }} />
      {/* <Tab.Screen name="Transaction" component={TransactionScreen} options={{ tabBarLabel: 'Giao dịch' }} />
      <Tab.Screen name="Customer" component={CustomerScreen} options={{ tabBarLabel: 'Khách hàng' }} /> */}
     
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} options={{ tabBarLabel: 'Lịch' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: 'Thống kê' }} />
      <Tab.Screen name="Setting" component={SettingScreen} options={{ tabBarLabel: 'Cài đặt' }} />

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
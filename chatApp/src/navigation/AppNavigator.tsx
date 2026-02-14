import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ChatScreen from '../screens/ChatScreen';
import TabNavigator from './TabNavigator';
import CreateGroupScreen from '../screens/TabScreens/CreateGroupScreen';
import { colors } from '../utils/styles';

const Stack = createStackNavigator();

const AppNavigator = ({ user }: any) => {
  if (!user) {
    // Auth-only stack (no tabs)
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  // Logged-in stack (tabs + chat overlay)
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: false,
          title: route.params?.otherUser?.name || 'Chat',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
        })}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ headerShown: false, title: 'Create Group' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from '../screens/ChatScreen';
import TabNavigator from './TabNavigator';
import CreateGroupScreen from '../screens/TabScreens/CreateGroupScreen';
import { colors } from '../utils/styles';
import ProfileScreen from '../screens/AppScreen/AppProfileScreen';
import StoryViewer from '../screens/AppScreen/StoryViewer';
import CreateStoryScreen from '../screens/AppScreen/CreateStoryScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
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
        options={({ route }: any) => ({
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
      <Stack.Screen
        name="userProfile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StoryViewer"
        component={StoryViewer}
        options={{
          presentation: 'modal',
          headerShown: false,
          cardStyle: { backgroundColor: 'black' },
        }}
      />
      <Stack.Screen
        name="CreateStory"
        component={CreateStoryScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
          cardStyle: { backgroundColor: 'black' },
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;

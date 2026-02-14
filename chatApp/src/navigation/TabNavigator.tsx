import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../utils/styles';
import HomeScreen from '../screens/TabScreens/HomeScreen';
import UsersScreen from '../screens/TabScreens/UsersScreen';
import MessagesScreen from '../screens/TabScreens/MessagesScreen';
import ProfileScreen from '../screens/TabScreens/ProfileScreen';
import GroupsScreen from '../screens/TabScreens/GroupsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <View style={{ flex: 1, backgroundColor: colors.primary }}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home')
            iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Users')
            iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Messages')
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          else if (route.name === 'Groups')
            iconName = focused ? 'people-sharp' : 'people-outline';
          else if (route.name === 'Profile')
            iconName = focused ? 'person' : 'person-outline';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.background,
        tabBarInactiveTintColor: '#d1c8c8b9',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          height: 65,
          paddingTop: 8,
          borderTopRightRadius: 32,
          borderTopLeftRadius: 32,
          elevation: 5,
          position: 'absolute',
          overflow: 'hidden',
        },
        animation: 'shift',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </View>
);

export default TabNavigator;

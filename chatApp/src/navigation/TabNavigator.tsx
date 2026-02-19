import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../utils/styles';

import HomeScreen from '../screens/TabScreens/HomeScreen';
import UsersScreen from '../screens/TabScreens/UsersScreen';
import MessagesScreen from '../screens/TabScreens/MessagesScreen';
import ProfileScreen from '../screens/TabScreens/ProfileScreen';
import GroupsScreen from '../screens/TabScreens/GroupsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Users" component={UsersScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Groups" component={GroupsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
};

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors }: any = useTheme();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 2 }]}>
      <View
        style={[
          styles.container,
          { borderWidth: 1, borderColor: colors.Border_Color },
        ]}
      >
        {/* LEFT */}
        <TabIcon
          icon="home"
          route="Home"
          state={state}
          navigation={navigation}
          index={0}
        />
        <TabIcon
          icon="search"
          route="Users"
          state={state}
          navigation={navigation}
          index={1}
        />

        {/* CENTER BUTTON */}
        {/* <TouchableOpacity
          style={styles.centerBtn}
          onPress={() => navigation.navigate('Messages')}
          activeOpacity={0.8}
        >
          <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity> */}

        {/* RIGHT */}
        <TabIcon
          icon="compass"
          route="Groups"
          state={state}
          navigation={navigation}
          index={3}
        />
        <TabIcon
          icon="person"
          route="Profile"
          state={state}
          navigation={navigation}
          index={4}
        />
      </View>
    </View>
  );
}

const TabIcon = ({ icon, route, state, navigation, index }: any) => {
  const focused = state.index === index;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(route)}
      style={styles.iconBtn}
      activeOpacity={0.7}
    >
      <Icon
        name={focused ? icon : `${icon}-outline`}
        size={26}
        color={focused ? '#6c7cff' : '#aaa'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    // bottom: 18,
    left: 16,
    right: 16,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#0b1220',
    height: 60,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconBtn: {
    flex: 1,
    alignItems: 'center',
  },
  centerBtn: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: '#6c7cff',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#6c7cff',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 12,
  },
});

export default TabNavigator;

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Splash } from '../onboarding/Splash';

const Stack = createNativeStackNavigator();

export function SplashNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animationTypeForReplace: 'push',
        orientation: 'portrait',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="splash"
        component={Splash}
        options={{
          headerShown: false,
          navigationBarHidden: true,
          // statusBarHidden: true,
        }}
      />
    </Stack.Navigator>
  );
}

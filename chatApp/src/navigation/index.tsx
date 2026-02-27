import React from 'react';
import { ActivityIndicator, AppState, Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { setInitializing } from '../redux/slice/contentSlice';
// import { SplashNavigator } from './SplashNavigator';
// import Step2 from '../screens/AuthScreens/Step2';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { SplashNavigator } from './SplashNavigator';
import {
  setAuthenticated,
  setCurrentFirebaseUser,
  setCurrentUser,
} from '../redux/slice/authSlice';

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const baseUrl = useAppSelector((state: any) => state.content.baseUrl);
  const { isAuthenticated }: any = useAppSelector((state: any) => state.auth);
  const { initializing }: any = useAppSelector((state: any) => state.content);
  const colors: any = useTheme().colors;
  const onAuthStateChanged = async (user: any) => {
    dispatch(setCurrentFirebaseUser(user));

    // Load backend user
    try {
      const res = await AsyncStorage.getItem('currentUser');
      const currentUserInfo = res ? JSON.parse(res) : null;

      if (currentUserInfo) {
        dispatch(setCurrentUser(currentUserInfo));
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setCurrentUser(null));
        dispatch(setAuthenticated(false));
      }
    } catch (error) {
      console.error(error);
      dispatch(setCurrentUser(null));
      dispatch(setAuthenticated(false));
    }

    dispatch(setInitializing(false));
  };

  React.useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      dispatch(setInitializing(false));
    }, 2500);
  }, [initializing]);

  // Show splash while initializing
  if (initializing) return <SplashNavigator />;

  return isAuthenticated ? (
    <>
      <AppNavigator />
    </>
  ) : (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
      <AuthNavigator />
    </SafeAreaView>
  );
}

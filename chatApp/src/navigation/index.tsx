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

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const baseUrl = useAppSelector((state: any) => state.content.baseUrl);
  const { isAuthenticated }: any = useAppSelector((state: any) => state.auth);
  const { initializing }: any = useAppSelector((state: any) => state.content);
  const colors: any = useTheme().colors;

  React.useEffect(() => {   
    setTimeout(() => {
      dispatch(setInitializing(false));
    }, 3500);
  }, []);


  // Show splash while initializing
  if (initializing) return <ActivityIndicator size={'large'} color={'blue'} />;

  return isAuthenticated ? (
    <>
      <AppNavigator />
    </>
  ) : (
    <SafeAreaView
      edges={['left', 'right']}
      style={{ flex: 1, }}
    >
      <AuthNavigator />
    </SafeAreaView>
  );
}

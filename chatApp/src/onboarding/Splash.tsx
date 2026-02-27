import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { mobileH } from '../utils/Utils';
import { SplashScreenLogo, SplashText } from '../utils/Icons';
import { useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import Layout from '../screens/Layout';

export function Splash() {
  const colors: any = useTheme().colors;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    versionText: {
      position: 'absolute',
      bottom: mobileH * 0.03,
      color: colors.Secondary_Color,
    },
  });

  return (
    <Layout>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <SplashScreenLogo />

        <View style={{ marginTop: 10 }}>
          <SplashText />
        </View>
      </View>
    </Layout>
  );
}

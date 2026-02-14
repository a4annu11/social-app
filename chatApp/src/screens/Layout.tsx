import React from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/styles';

const Layout = ({
  children,
  marginHorizontal,
  statusBarColor,
  paddingBottom,
}: any) => {
  const scheme = useColorScheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: statusBarColor ? statusBarColor : colors.background,
      }}
    >
      <StatusBar
        hidden={false}
        translucent={true}
        // barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        barStyle={'dark-content'}
        backgroundColor={'transparent'}
        networkActivityIndicatorVisible={true}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          // marginHorizontal: marginHorizontal === 0 ? marginHorizontal : 16,
          // marginTop: mobileH * 0.01,
          paddingBottom: paddingBottom ? paddingBottom : 65,
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

export default Layout;

import React from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const Layout = ({
  children,
  marginHorizontal,
  statusBarColor,
  paddingBottom,
  paddingTop,
}: any) => {
  const scheme = useColorScheme();
  const { colors }: any = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0F1223', '#2a466e', '#000000']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
        <StatusBar
          hidden={false}
          translucent={true}
          barStyle={'light-content'}
          backgroundColor={'transparent'}
        />

        <View
          style={{
            flex: 1,
            marginHorizontal: !marginHorizontal
              ? 0
              : marginHorizontal === 0
              ? 0
              : marginHorizontal
              ? marginHorizontal
              : 12,
            paddingTop: !paddingTop ? 0 : paddingTop ?? insets.top,
            paddingBottom: paddingBottom ?? insets.bottom,
          }}
        >
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Layout;

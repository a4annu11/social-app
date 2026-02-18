import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, AppState, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SheetProvider } from 'react-native-actions-sheet';

import { ConversationProvider } from './src/context/ConversationContext';
import FlashMessage from 'react-native-flash-message';
import { RootNavigator } from './src/navigation';
import { Provider } from 'react-redux';
import { persistor, store } from './src/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { theme } from './src/theme';

const App = () => {
  const scheme = useColorScheme();
  const currentTheme = scheme === 'dark' ? theme.dark : theme.light;

  return (
 <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
      <SafeAreaProvider>
        <PersistGate loading={null} persistor={persistor}>
          <ConversationProvider>


         
              <NavigationContainer theme={currentTheme}>
               
                <SheetProvider>
                  <FlashMessage position="top" duration={2000} />
                  <RootNavigator />
                </SheetProvider>
              
              </NavigationContainer>         
          </ConversationProvider>
        </PersistGate>
      </SafeAreaProvider>
    </Provider>
    </GestureHandlerRootView>

  );
};

export default App;

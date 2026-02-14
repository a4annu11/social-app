import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from './src/utils/styles';
import {
  onAuthStateChanged,
  usersRef,
  serverTimestamp,
} from './src/services/firebase';
import AppNavigator from './src/navigation/AppNavigator';
import { ConversationProvider } from './src/context/ConversationContext';
import FlashMessage from 'react-native-flash-message';

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const currentUidRef = useRef<string | null>(null);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Single auth listener
  useEffect(() => {
    const subscriber = onAuthStateChanged((user: any) => {
      console.log(
        'Auth change:',
        user ? `Logged in: ${user.uid}` : 'Logged out',
      );
      setUser(user);
      if (initializing) setInitializing(false);

      if (user) {
        currentUidRef.current = user.uid;
        // Manual online set with verify
        usersRef()
          .doc(user.uid)
          .update({ isOnline: true })
          .then(() => {
            console.log('Manual online set SUCCESS for', user.uid);
            // Verify
            return usersRef().doc(user.uid).get();
          })
          .then(doc => {
            const isOnline = doc.data()?.isOnline;
            console.log(
              'Verify isOnline after set:',
              isOnline ? 'true' : 'false',
            );
            if (!isOnline) console.error('Write failed—check rules/data!');
          })
          .catch(error => {
            console.error('Online set ERROR:', error.code, error.message);
          });
      } else {
        // Logout offline
        const lastUid = currentUidRef.current;
        if (lastUid) {
          usersRef()
            .doc(lastUid)
            .update({ isOnline: false, lastSeen: serverTimestamp() })
            .then(() => console.log('Manual offline set for', lastUid))
            .catch(error => console.error('Offline set error:', error));
          currentUidRef.current = null;
        }
      }
    });
    return subscriber;
  }, [initializing]);

  // AppState listener (no DB)
  useEffect(() => {
    let isGracePeriod = true; // Start in grace
    const handleAppStateChange = (nextAppState: string) => {
      const uid = currentUidRef.current;
      if (!uid || isGracePeriod) return;

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App background - setting offline for', uid);
        usersRef()
          .doc(uid)
          .update({ isOnline: false, lastSeen: serverTimestamp() })
          .then(() => console.log('Background offline set'))
          .catch(error => console.error('Background offline error:', error));
      } else if (nextAppState === 'active') {
        console.log('App foreground - setting online for', uid);
        usersRef()
          .doc(uid)
          .update({ isOnline: true })
          .then(() => console.log('Foreground online set'))
          .catch(error => console.error('Foreground online error:', error));
      }
    };

    // Grace: Enable after 10s (covers login/mount)
    graceTimerRef.current = setTimeout(() => {
      isGracePeriod = false;
      console.log('AppState grace ended - listener active');
    }, 10000);

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription?.remove();
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, []);

  if (initializing) {
    return <ActivityIndicator size="large" style={globalStyles.center} />;
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <NavigationContainer>
        <SafeAreaView
          edges={['bottom']}
          style={{ flex: 1, backgroundColor: colors.background }}
        >
          <ConversationProvider>
            <FlashMessage
              position="top"
              duration={4000}
              statusBarHeight={30}
              style={{
                borderRadius: 10,
                margin: 10,
              }}
            />
            <AppNavigator user={user} />
          </ConversationProvider>
        </SafeAreaView>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

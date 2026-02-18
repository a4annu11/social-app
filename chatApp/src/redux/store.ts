// src/redux/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slice/authSlice';
import contentReducer from './slice/contentSlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  content: contentReducer,
});

// Persist config — only persist auth
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth',],
  blacklist: ['auth.accessToken'], 
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

import {createSlice} from '@reduxjs/toolkit';

const initialState: any = {
  initializing: true,
  accessToken: null,
  isAuthenticated: false,
  currentUser: null,
  currentFirebaseUser: null,
  firstLaunch: false,
  deviceId: null,
  notificationPermissionStatus: null,
  showNotification: false,
  notificationId: null,
  notificationHistory: false,
  isConnectionLost: false,
};

const authSlice: any = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentFirebaseUser: (state: any, action: any) => {
      state.currentFirebaseUser = action.payload;
    },
    setCurrentUser: (state: any, action: any) => {
      state.currentUser = action.payload;
      state.showNotification = action.payload.notificationStatus === 'Yes';
      state.notificationHistory = action.payload.notificationHistory === 'Yes';
    },
    setInitializing: (state: any, action: any) => {
      state.initializing = action.payload;
    },
    setFirstLaunch: (state: any, action: any) => {
      state.firstLaunch = action.payload;
    },
    setAuthenticated: (state: any, action: any) => {
      state.isAuthenticated = action.payload;
    },
    setDeviceId: (state: any, action: any) => {
      state.deviceId = action.payload;
    },
    setNotificationPermission: (state: any, action: any) => {
      state.notificationPermissionStatus = action.payload;
    },
    setNotificationId: (state: any, action: any) => {
      state.notificationId = action.payload;
    },
    setShowNotification: (state: any, action: any) => {
      state.showNotification = action.payload;
    },
    setAccessToken: (state: any, action: any) => {
      state.accessToken = action.payload;
    },
    setUserRole: (state: any, action: any) => {
      state.userRole = action.payload;
    },

    logoutUser: (state: any) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.currentFirebaseUser = null;
      state.accessToken = null;
    },
    setIsConnectionLost: (state: any, action: any) => {
      state.isConnectionLost = action.payload;
    },
  },
});

export const {
  setCurrentFirebaseUser,
  setCurrentUser,
  setInitializing,
  setFirstLaunch,
  logoutUser,
  setAuthenticated,
  setDeviceId,
  setNotificationPermission,
  setNotificationId,
  setAccessToken,
  setShowNotification,
  setIsConnectionLost,
} = authSlice.actions;
export default authSlice.reducer;

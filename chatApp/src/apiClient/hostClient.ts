import auth from '@react-native-firebase/auth';

import { Platform } from 'react-native';

const ApiClient = async (route: any, options: any = {}) => {
  //   const state: any = store.getState();
  //   const { deviceId, notificationId }: any = state.auth;

  //   let token: any = state?.auth?.accessToken;
  // const BASE_URL = 'http://10.0.2.2:5000';
  const BASE_URL = 'https://socail-backend-cx8r.onrender.com'
  const token = '';

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
  try {
    console.log(BASE_URL + route, 'BASE_URL + route');
    const response = await fetch(BASE_URL + route, {
      ...options,
      headers,
    });
    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error, 'error from contentApiClient');
    return error;
  }
};

export default ApiClient;

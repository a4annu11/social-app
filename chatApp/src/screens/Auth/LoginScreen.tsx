import React, { use, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useForm, FormProvider } from 'react-hook-form';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';

import Layout from '../Layout';
import { showWarning } from '../../utils/ToastMessage';
import apiService from '../../api/apiService';
import { TextField } from '../../components/UI/Input';
import { typography } from '../../theme';
import {
  AppLogo,
  CloseEyeIcon,
  LockIcon,
  OpenEyeIcon,
  UserIcon,
} from '../../utils/Icons';
import { GradientButton } from '../../components/UI/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../redux/hooks';
import { setAccessToken, setAuthenticated } from '../../redux/slice/authSlice';

const LoginScreen = () => {
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<any>({});
  const { colors }: any = useTheme();
  const [shouldShow, setShouldShow] = useState(false);
  const dispatch = useAppDispatch();

  const methods = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: any) => {
    if (!data.username || !data.password) {
      showWarning('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.login({
        username: data.username,
        password: data.password,
      });

      if (!res.success) {
        showWarning(res.message);
        setLoading(false);
        return;
      }

      dispatch(setAccessToken(res?.token));

      const userProfile = await apiService.getMyProfile();
      if (!userProfile.success) {
        showWarning('Failed to get profile');
        setLoading(false);
        return;
      }
      await AsyncStorage.setItem('token', res.token);
      await auth().signInWithCustomToken(res.firebaseToken);
      dispatch(setAuthenticated(true));

      await AsyncStorage.setItem('currentUser', JSON.stringify(userProfile));
      // navigation.replace('Home');
    } catch (error: any) {
      showWarning(error.message);
    }

    setLoading(false);
  };

  return (
    <Layout marginHorizontal={14}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View
            style={{
              width: '100%',
              alignItems: 'center',
            }}
          >
            <AppLogo />
          </View>
          <Text
            style={{
              ...typography.Montserrat_Bold28,
              color: colors.Text_Primary_Color,
            }}
          >
            Welcome Back!
          </Text>
          <Text
            style={{
              ...typography.Montserrat_Regular16,
              color: colors.Text_Secondary_Color,
              marginBottom: 30,
              marginTop: 5,
              fontStyle: 'italic',
            }}
          >
            Step back into light of your Lumora
          </Text>
          <FormProvider {...methods}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.Card_Color,
                  borderColor: colors.Border_Color,
                  borderWidth: 0.5,
                },
              ]}
            >
              {/* <Text style={styles.title}>Login</Text> */}

              {/* Username */}
              <TextField
                name="username"
                // label="Username"
                placeholder="Enter your username"
                LeftIcon={UserIcon}
                returnKeyType="next"
                inputRefs={inputRefs}
                refName="password"
                rules={{ required: 'Username is required' }}
              />

              {/* Password */}
              <TextField
                name="password"
                // label="Password"
                placeholder="Enter your password"
                LeftIcon={LockIcon}
                RightIcon={shouldShow ? CloseEyeIcon : OpenEyeIcon}
                handleRightIconPress={() => setShouldShow(!shouldShow)}
                secureTextEntry={!shouldShow}
                returnKeyType="done"
                inputRefs={inputRefs}
                rules={{ required: 'Password is required' }}
                showCharCount={false}
              />

              {/* Login Button */}
              <GradientButton
                title="Login"
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                loading={loading}
              />

              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerText}>
                  Don’t have an account?{' '}
                  <Text style={styles.linkText}>Register</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </FormProvider>
        </KeyboardAvoidingView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#171926',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
    gap: 25,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 25,
    fontSize: 14,
  },
  linkText: {
    fontWeight: '700',
  },
});

export default LoginScreen;

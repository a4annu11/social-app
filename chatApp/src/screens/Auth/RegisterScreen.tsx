import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useForm, FormProvider } from 'react-hook-form';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Layout from '../Layout';
import { showSuccess, showWarning } from '../../utils/ToastMessage';
import apiService from '../../api/apiService';
import { TextField } from '../../components/UI/Input';
import { GradientButton } from '../../components/UI/Button';
import { typography } from '../../theme';
import {
  AppLogo,
  CloseEyeIcon,
  LockIcon,
  OpenEyeIcon,
  UserIcon,
} from '../../utils/Icons';
import { setAccessToken, setAuthenticated } from '../../redux/slice/authSlice';
import { useAppDispatch } from '../../redux/hooks';

const RegisterScreen = () => {
  const navigation: any = useNavigation();
  const { colors }: any = useTheme();
  const [loading, setLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const inputRefs = useRef<any>({});
  const dispatch = useAppDispatch();

  const methods = useForm({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: any) => {
    if (!data.name || !data.username || !data.password) {
      showWarning('Please fill all required fields');
      return;
    }

    if (data.password.length < 6) {
      showWarning('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await apiService.signUp({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
      });

      if (!res?.success) {
        showWarning(res?.message || 'Registration failed');
        setLoading(false);
        return;
      }

      dispatch(setAccessToken(res?.token));
      await AsyncStorage.setItem('token', res?.token);
      await auth().signInWithCustomToken(res?.firebaseToken);

      const userProfile = await apiService.getMyProfile();
      if (!userProfile.success) {
        showWarning('Failed to get profile');
        setLoading(false);
        return;
      }

      dispatch(setAuthenticated(true));
      await AsyncStorage.setItem('currentUser', JSON.stringify(userProfile));

      showSuccess('Account created successfully!');
      // navigation.replace('Home');
    } catch (error: any) {
      showWarning(error?.message || 'Something went wrong');
    }

    setLoading(false);
  };

  return (
    <Layout marginHorizontal={14}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Logo */}
            <View style={{ width: '100%', alignItems: 'center' }}>
              <AppLogo />
            </View>

            {/* Title */}
            <Text
              style={{
                ...typography.Montserrat_Bold28,
                color: colors.Text_Primary_Color,
              }}
            >
              Create Account
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
              Step into the light of Lumora
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
                {/* Full Name */}
                <TextField
                  name="name"
                  placeholder="Enter your full name"
                  LeftIcon={UserIcon}
                  returnKeyType="next"
                  inputRefs={inputRefs}
                  refName="username"
                  rules={{ required: 'Name is required' }}
                />

                {/* Username */}
                <TextField
                  name="username"
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
                  placeholder="Enter your password"
                  LeftIcon={LockIcon}
                  RightIcon={shouldShow ? CloseEyeIcon : OpenEyeIcon}
                  handleRightIconPress={() => setShouldShow(!shouldShow)}
                  secureTextEntry={!shouldShow}
                  returnKeyType="done"
                  inputRefs={inputRefs}
                  rules={{ required: 'Password is required' }}
                />

                {/* Register Button */}
                <GradientButton
                  title="Register"
                  onPress={handleSubmit(onSubmit)}
                  disabled={loading}
                  loading={loading}
                />

                {/* Navigate to Login */}
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerText}>
                    Already have an account?{' '}
                    <Text style={styles.linkText}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </FormProvider>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 40,
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

export default RegisterScreen;

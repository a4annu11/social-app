import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, FormProvider } from 'react-hook-form';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';

import Layout from '../Layout';
import { showWarning } from '../../utils/ToastMessage';
import apiService from '../../api/apiService';
import { colors } from '../../utils/styles';
import { TextField } from '../../components/UI/Input';

const LoginScreen = () => {
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<any>({});

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

      await auth().signInWithCustomToken(res.firebaseToken);
    } catch (error: any) {
      showWarning(error.message);
    }

    setLoading(false);
  };

  return (
    <Layout marginHorizontal={14}>
      <View style={{ flex: 1, }}>


      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 2, fontStyle: 'italic' }}>Welcome Back!</Text>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>Login to continue</Text>
        <FormProvider {...methods}>
          <View style={styles.card}>
            {/* <Text style={styles.title}>Login</Text> */}

            {/* Username */}
            <TextField
              name="username"
              // label="Username"
              placeholder="Enter your username"
              returnKeyType="next"
              inputRefs={inputRefs}
              refName="password"
              rules={{ required: 'Username is required' }}
              backgroundColor="#F3F4F6"
            />

            {/* Password */}
            <TextField
              name="password"
              // label="Password"
              placeholder="Enter your password"
              secureTextEntry
              returnKeyType="done"
              inputRefs={inputRefs}
              rules={{ required: 'Password is required' }}
              backgroundColor="#F3F4F6"
              showCharCount={false}
            />

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
            >
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
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  subText: {
    color: '#E8E8E8',
    fontSize: 15,
    marginTop: 6,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    // marginTop: -60,
  },
  card: {
    backgroundColor: '#fff',
    // marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    gap: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
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
    color: colors.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;

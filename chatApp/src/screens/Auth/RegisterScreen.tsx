import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { globalStyles, colors } from '../../utils/styles';
import {
  createUserWithEmailAndPassword,
  usersRef,
  serverTimestamp,
  currentUser,
} from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';
import Layout from '../Layout';
import LinearGradient from 'react-native-linear-gradient';
import { showSuccess, showWarning } from '../../utils/ToastMessage';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation: any = useNavigation();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password.length < 6) {
      // Alert.alert('Error', 'Password must be at least 6 characters');
      showWarning('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(email, password);
      // Save user profile to Firestore
      await usersRef().doc(user.uid).set({
        name,
        email: user.email,
        uid: user.uid,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isOnline: true,
      });
      // Alert.alert('Success', 'Account created! Logging in...');
      showSuccess('Account created! Logging in...');
      // Navigation handled by auth listener in App.js
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <Layout statusBarColor={colors.primary}>
      <LinearGradient
        colors={[colors.primary, '#6C63FF']}
        style={styles.header}
      >
        <Text style={styles.headerText}>Create Account ✨</Text>
        <Text style={styles.subText}>Join us and start chatting</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Register</Text>

          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.linkText}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  subText: {
    color: '#E8E8E8',
    fontSize: 14,
    marginTop: 4,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -40,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.primary,
  },
  input: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
    color: '#333',
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#555',
    marginTop: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;

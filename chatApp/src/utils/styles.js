import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#525199ff',
  secondary: '#759b43ff',
  background: '#dce3eeff',
  text: '#000000',
  textSecondary: '#525258ff',
  success: '#34C759',
  error: '#e2564eff',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.textSecondary,
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    textAlign: 'center',
    color: colors.primary,
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.textSecondary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

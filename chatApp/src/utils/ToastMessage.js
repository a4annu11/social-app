import { showMessage } from 'react-native-flash-message';
import { mobileH } from '../utils/Utils';

const baseStyle = {
  marginTop: 23,
  marginHorizontal: 12,
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 4, // Android shadow
  // marginBottom: mobileH * 0.06,
};

const textStyle = {
  fontSize: 15,
  fontWeight: '500',
};

const showError = message => {
  showMessage({
    type: 'danger',
    message,
    backgroundColor: '#E63946', // bold red
    color: '#fff',
    style: baseStyle,
    titleStyle: textStyle,
    floating: true,
    icon: { icon: 'danger', position: 'left' },
  });
};

const showSuccess = message => {
  showMessage({
    type: 'success',
    message,
    backgroundColor: 'green', // teal green
    color: '#fff',
    style: baseStyle,
    titleStyle: textStyle,
    floating: true,
    icon: { icon: 'success', position: 'left' },
  });
};

const showWarning = message => {
  showMessage({
    type: 'warning',
    message,
    backgroundColor: '#F4A261', // amber
    color: '#000',
    style: baseStyle,
    titleStyle: textStyle,
    floating: true,
    icon: { icon: 'warning', position: 'left' },
  });
};

const showInfo = message => {
  showMessage({
    type: 'info',
    message,
    backgroundColor: '#457B9D', // calm blue
    color: '#fff',
    style: baseStyle,
    titleStyle: textStyle,
    floating: true,
    icon: { icon: 'info', position: 'left' },
  });
};

export { showError, showSuccess, showWarning, showInfo };

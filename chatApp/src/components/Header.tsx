import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or MaterialIcons
import { globalStyles, colors } from '../utils/styles';

const Header = ({ title, onBack, rightIcon, onRightPress }: any) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: colors.primary,
    }}
  >
    {onBack && (
      <TouchableOpacity onPress={onBack}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    )}
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
      {title}
    </Text>
    {rightIcon && (
      <TouchableOpacity onPress={onRightPress}>
        <Icon name={rightIcon} size={24} color="#fff" />
      </TouchableOpacity>
    )}
  </View>
);

export default Header;

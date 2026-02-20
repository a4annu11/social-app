import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppNameLogo } from '../utils/Icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { typography } from '../theme';

const AppHeader = ({
  isLogo = false,
  title = '',
  rightIcon1,
  onPressRightIcon1,
  rightIcon2,
  onPressRightIcon2,
}: any) => {
  const { colors }: any = useTheme();
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {isLogo ? (
          <AppNameLogo />
        ) : (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.Colored_Text} />
          </TouchableOpacity>
        )}
        <Text
          style={{
            ...typography.Montserrat_Bold18,
            color: colors.Colored_Text,
          }}
        >
          {title}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
        {rightIcon1 && (
          <TouchableOpacity onPress={onPressRightIcon1}>
            {rightIcon1}
          </TouchableOpacity>
        )}
        {rightIcon2 && (
          <TouchableOpacity onPress={onPressRightIcon2}>
            {rightIcon2}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({});

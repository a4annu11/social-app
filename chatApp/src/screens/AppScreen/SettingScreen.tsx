import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { typography } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  CustomToggle,
  GradientButton,
  OutLineButton,
} from '../../components/UI/Button';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import apiService from '../../api/apiService';
import { setCurrentUser } from '../../redux/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showSuccess } from '../../utils/ToastMessage';
import { SheetManager } from 'react-native-actions-sheet';

const SettingScreen = ({ navigation }: any) => {
  const { colors }: any = useTheme();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAppSelector((state: any) => state.auth);
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate ?? false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsPrivate(currentUser?.isPrivate ?? false);
  }, [currentUser]);
  const togglePrivacy = async () => {
    const previous = isPrivate;
    setIsPrivate(!previous);

    try {
      const res = await apiService.togglePrivateAccount();
      if (res?.success) {
        showSuccess(res?.message || 'Account privacy updated');
        dispatch(setCurrentUser({ ...currentUser, isPrivate: res?.isPrivate }));
        await AsyncStorage.setItem(
          'currentUser',
          JSON.stringify({ ...currentUser, isPrivate: res?.isPrivate }),
        );
      } else {
        setIsPrivate(previous);
      }
    } catch (error) {
      setIsPrivate(previous);
    }
  };
  return (
    <Layout paddingTop={insets.top}>
      <AppHeader isLogo={false} title="Settings" />
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View
          style={{
            flex: 1,
            paddingVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              gap: 10,
            }}
          >
            <Icon
              name="lock-closed"
              size={22}
              color={colors.Text_Primary_Color}
            />
            <Text
              style={{
                ...typography.Montserrat_SemiBold18,
                color: colors.Text_Primary_Color,
              }}
            >
              Private Account
            </Text>
          </View>
          {/* Toggle */}
          <View>
            <CustomToggle
              value={isPrivate}
              onToggle={togglePrivacy}
              activeColor={colors.Colored_Text}
            />
          </View>
        </View>

        <Pressable
          onPress={() => {
            navigation.navigate('savedPost');
          }}
        >
          <View
            style={{
              flex: 1,
              paddingVertical: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                gap: 10,
              }}
            >
              <Icon
                name="bookmark"
                size={22}
                color={colors.Text_Primary_Color}
              />
              <Text
                style={{
                  ...typography.Montserrat_SemiBold18,
                  color: colors.Text_Primary_Color,
                }}
              >
                Saved Posts
              </Text>
            </View>
            {/* Toggle */}
            <View>
              <Icon
                name="chevron-forward"
                size={22}
                color={colors.Colored_Text}
              />
            </View>
          </View>
        </Pressable>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          marginBottom: insets.bottom,
        }}
      >
        <View style={{ flex: 1 }}>
          <OutLineButton title="Delete Account" />
        </View>

        <View style={{ flex: 1 }}>
          <GradientButton
            title="Logout"
            onPress={() => {
              SheetManager.show('LogoutSheet');
            }}
          />
        </View>
      </View>
    </Layout>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({});

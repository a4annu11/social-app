import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import MessageIcon from 'react-native-vector-icons/Fontisto';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <Layout paddingTop={insets.top}>
      <AppHeader
        isLogo={true}
        rightIcon1={<MessageIcon name="messenger" size={22} color={'#fff'} />}
      />
      <Text>HomeScreen</Text>
    </Layout>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});

import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import apiService from '../../api/apiService';

const MyFollowRequest = () => {
  const { colors }: any = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const fetchFollowRequests = async () => {
    setLoading(true);
    try {
      const res = await apiService.getMyFollowRequests();
    } catch (error) {
      console.log('Error in Follow req', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowRequests();
  }, []);
  return (
    <Layout paddingTop={insets.top}>
      <AppHeader isLogo={false} title="Pending Requests" />
    </Layout>
  );
};

export default MyFollowRequest;

const styles = StyleSheet.create({});

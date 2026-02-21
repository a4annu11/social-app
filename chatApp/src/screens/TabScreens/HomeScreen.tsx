import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import NotificationIcon from 'react-native-vector-icons/Fontisto';
import PostCard from '../../components/PostCard';
import Story from '../../components/Story';
import { useAppSelector } from '../../redux/hooks';
import apiService from '../../api/apiService';
import { useTheme } from '@react-navigation/native';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors }: any = useTheme();
  const { currentUser } = useAppSelector((state: any) => state.auth);
  console.log('HOME CURRENT USER', currentUser);
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await apiService.getFeed();
      setFeedData(res?.posts);
    } catch (error) {
      console.log('Error in GET FEED', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <Layout paddingTop={insets.top}>
      <AppHeader
        isLogo={true}
        rightIcon1={
          <NotificationIcon name="bell" size={22} color={colors.Colored_Text} />
        }
      />
      {/* <Story /> */}

      <FlatList
        data={feedData}
        renderItem={({ item }: any) => <PostCard post={item} />}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Story />}
        contentContainerStyle={{
          backgroundColor: '#111a30',
          paddingBottom: 70,
        }}
        ListFooterComponent={
          loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          ) : null
        }
      />
    </Layout>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});

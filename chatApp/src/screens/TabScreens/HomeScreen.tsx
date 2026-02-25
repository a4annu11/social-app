import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import NotificationIcon from 'react-native-vector-icons/Fontisto';
import PostCard from '../../components/PostCard';
import Story from '../../components/Story';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import apiService from '../../api/apiService';
import { useTheme } from '@react-navigation/native';
import ShareQuote from '../../components/ShareQuote';
import { setFeedData } from '../../redux/slice/contentSlice';
import RequestIcon from 'react-native-vector-icons/FontAwesome6';

const HomeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors }: any = useTheme();
  const { currentUser } = useAppSelector((state: any) => state.auth);

  const { feedData } = useAppSelector((state: any) => state.content);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [storyData, setStoryData] = useState([]);

  const fetchFeed = async () => {
    try {
      const res = await apiService.getFeed();
      dispatch(setFeedData(res?.posts || []));
    } catch (error) {
      console.log('Error in GET FEED', error);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await apiService.getStoryFeed();
      setStoryData(res?.stories || []);
    } catch (error) {
      console.log('Error in GET STORY FEED', error);
    }
  };

  const initialLoad = async () => {
    setLoading(true);
    await Promise.all([fetchFeed(), fetchStories()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFeed(), fetchStories()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    initialLoad();

    const refreshListener = DeviceEventEmitter.addListener(
      'REFRESH_HOME_FEED',
      () => {
        console.log('Refreshing from another screen...');
        initialLoad();
      },
    );

    return () => {
      refreshListener.remove();
    };
  }, []);

  return (
    <Layout paddingTop={insets.top}>
      <AppHeader
        isLogo={true}
        rightIcon1={
          <RequestIcon
            name="user-clock"
            size={20}
            color={colors.Colored_Text}
          />
        }
        onPressRightIcon1={() => {
          navigation.navigate('followRequest');
        }}
        rightIcon2={
          <NotificationIcon name="bell" size={22} color={colors.Colored_Text} />
        }
      />

      <FlatList
        data={feedData}
        renderItem={({ item }: any) => <PostCard post={item} />}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => {
          return (
            <>
              <Story stories={storyData} />
              <ShareQuote />
            </>
          );
        }}
        contentContainerStyle={{
          backgroundColor: '#111a30',
          paddingBottom: 70,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        ListFooterComponent={
          loading ? (
            <View
              style={{
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

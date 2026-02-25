import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import apiService from '../../../api/apiService';
import { showError } from '../../../utils/ToastMessage';
import AppHeader from '../../../components/AppHeader';
import PostCard from '../../../components/PostCard';

const SavedPost = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { colors }: any = useTheme();
  const [postLoading, setPostLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const fetchUserPosts = async () => {
    setPostLoading(true);
    try {
      const res = await apiService.getSavedPosts();

      if (res?.success) {
        setPosts(res?.posts);
      } else {
        showError('Failed to fetch posts');
      }
    } catch (error) {
      console.log('Error in GET SAVED POSTS', error);
    } finally {
      setPostLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, []);

  return (
    <Layout paddingTop={insets.top}>
      <AppHeader isLogo={false} title={'Saved Post'} />
      <View style={{ flex: 1, backgroundColor: '#111a30' }}>
        <View style={{ flex: 1 }}>
          {postLoading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{ margin: 20 }}
            />
          ) : (
            <FlatList
              data={posts}
              scrollEnabled={false}
              keyExtractor={(item: any) => item._id}
              renderItem={({ item }: any) => (
                <PostCard post={item} posts={posts} setPosts={setPosts} />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                backgroundColor: '#111a30',
                paddingBottom: 70,
              }}
              // ListFooterComponent={() => (
              //   <ActivityIndicator
              //     size="large"
              //     color="#0000ff"
              //     style={{ margin: 20 }}
              //   />
              // )}
            />
          )}
        </View>
      </View>
    </Layout>
  );
};

export default SavedPost;

const styles = StyleSheet.create({});

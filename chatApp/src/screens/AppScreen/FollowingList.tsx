import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import Layout from '../Layout';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../api/apiService';
import { typography } from '../../theme';
import AppHeader from '../../components/AppHeader';

const LIMIT = 20;

const FollowingList = ({ navigation, route }: any) => {
  const { colors }: any = useTheme();
  const insets = useSafeAreaInsets();
  const userId = route.params?.userId;

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFollowing(true);
  }, []);

  //  Local Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        user =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const fetchFollowing = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setOffset(0);
      } else {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
      }

      const currentOffset = isInitial ? 0 : offset;

      const res: any = await apiService.getUserFollowing({
        userId,
        limit: LIMIT,
        offset: currentOffset,
      });

      if (res?.success) {
        const newData = res.data || [];

        if (isInitial) {
          setAllUsers(newData);
        } else {
          setAllUsers(prev => [...prev, ...newData]);
        }

        setHasMore(newData.length === LIMIT);
        setOffset(currentOffset + LIMIT);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() =>
        navigation.navigate('userProfile', {
          username: item?.username,
          userId: item?._id,
        })
      }
    >
      <Image
        source={
          item?.profilePicture
            ? { uri: item.profilePicture }
            : require('../../../assets/images/default-user.png')
        }
        style={styles.avatar}
      />

      <View style={{ marginLeft: 12 }}>
        <Text
          style={{
            ...typography.Montserrat_SemiBold14,
            color: colors.Text_Primary_Color,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            color: colors.Text_Secondary_Color,
            opacity: 0.7,
          }}
        >
          @{item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Layout paddingTop={insets.top}>
      <AppHeader title="Following" />

      <View style={styles.container}>
        {/* 🔎 Search Input */}
        <TextInput
          placeholder="Search following..."
          placeholderTextColor={colors.Text_Secondary_Color}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.input,
            {
              borderColor: colors.Border_Color,
              color: colors.Text_Primary_Color,
            },
          ]}
        />

        {loading && allUsers.length === 0 ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            onEndReached={() => {
              if (!searchQuery) fetchFollowing(false);
            }}
            onEndReachedThreshold={0.4}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              loadingMore && !searchQuery ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
            ListEmptyComponent={
              !loading && (
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: 20,
                    color: colors.Text_Secondary_Color,
                  }}
                >
                  {searchQuery ? 'No matching users' : 'No following yet'}
                </Text>
              )
            }
          />
        )}
      </View>
    </Layout>
  );
};

export default FollowingList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
});

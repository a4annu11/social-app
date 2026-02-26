import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import Layout from '../Layout';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../api/apiService';
import { typography } from '../../theme';
import AppHeader from '../../components/AppHeader';

const LIMIT = 20;

const SearchScreen = ({ navigation }: any) => {
  const { colors }: any = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [searching, setSearching] = useState(false); // main loader
  const [loadingMore, setLoadingMore] = useState(false); // footer loader
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const isInitialSearch = useRef(true);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(true);
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (isNewSearch = false) => {
    if (!query.trim()) return;

    try {
      if (isNewSearch) {
        setSearching(true);
        setHasMore(true);
        setOffset(0);
      } else {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
      }

      const currentOffset = isNewSearch ? 0 : offset;

      const res: any = await apiService.searchUsers({
        query,
        limit: LIMIT,
        offset: currentOffset,
      });

      if (res?.success) {
        const newUsers = res.data || [];

        if (isNewSearch) {
          setUsers(newUsers);
        } else {
          setUsers(prev => [...prev, ...newUsers]);
        }

        setHasMore(newUsers.length === LIMIT);
        setOffset(currentOffset + LIMIT);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSearching(false);
      setLoadingMore(false);
      isInitialSearch.current = false;
    }
  };

  const loadMore = () => {
    if (!searching && hasMore && users.length >= LIMIT) {
      handleSearch(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => {
        navigation.navigate('userProfile', {
          username: item?.username,
          userId: item?._id,
        });
      }}
    >
      <Image
        source={
          item?.profilePicture
            ? {
                uri: item.profilePicture,
              }
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
      <AppHeader isLogo={true} />
      <View style={styles.container}>
        {/* Search Input */}
        <TextInput
          placeholder="Search by username or name..."
          placeholderTextColor={colors.Text_Secondary_Color}
          value={query}
          onChangeText={text => setQuery(text)}
          style={[
            styles.input,
            {
              borderColor: colors.Border_Color,
              color: colors.Text_Primary_Color,
            },
          ]}
        />

        {/* Main Loader */}
        {searching && users.length === 0 && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 20 }}
          />
        )}

        <FlatList
          data={users}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            loadingMore && users.length > 0 ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={
            !searching && query.length > 0 ? (
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 20,
                  color: colors.Text_Secondary_Color,
                }}
              >
                No users found
              </Text>
            ) : null
          }
        />
      </View>
    </Layout>
  );
};

export default SearchScreen;

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

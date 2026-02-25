import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import apiService from '../../api/apiService';
import { typography } from '../../theme';

const MyFollowRequest = () => {
  const { colors }: any = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  const fetchFollowRequests = async () => {
    setLoading(true);
    try {
      const res = await apiService.getMyFollowRequests();

      if (res?.success) {
        setRequests(res.data);
      }
    } catch (error) {
      console.log('Error in Follow req', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowRequests();
  }, []);

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.card,
        {
          borderColor: colors.Border_Color,
          backgroundColor: colors.Card_Color,
        },
      ]}
    >
      <View style={styles.userInfo}>
        <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
        <View>
          <Text
            style={{
              ...typography.Montserrat_Bold16,
              color: colors.Text_Primary_Color,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              ...typography.Montserrat_Regular14,
              color: colors.Text_Secondary_Color,
            }}
          >
            @{item.username}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.acceptBtn}>
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rejectBtn}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Layout paddingTop={insets.top}>
      <AppHeader isLogo={false} title="Pending Requests" />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.text }}>No pending follow requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Layout>
  );
};

export default MyFollowRequest;

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  acceptBtn: {
    backgroundColor: '#305ab4',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  rejectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
});

// src/screens/main/UsersScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  usersRef,
  currentUser,
  getChatId,
  initializeChatDoc,
} from '../../services/firebase';
import { globalStyles, colors } from '../../utils/styles';
import { formatLastSeen } from '../../utils/time';
import Layout from '../Layout';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/147/147144.png';

const UsersScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const navigation: any = useNavigation();
  const currentUid = currentUser()?.uid;

  useEffect(() => {
    if (!currentUid) return;
    const unsubscribe = usersRef()
      .where('uid', '!=', currentUid)
      .onSnapshot(snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(list);
        setFilteredUsers(list);
        setLoading(false);
      });
    return unsubscribe;
  }, [currentUid]);

  // 🔍 Search and filter
  useEffect(() => {
    let data = [...users];
    if (filter === 'online') data = data.filter(u => u.isOnline);
    if (filter === 'recent')
      data = data.sort((a, b) => b.lastSeen?.seconds - a.lastSeen?.seconds);
    if (search)
      data = data.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()),
      );
    setFilteredUsers(data);
  }, [search, filter, users]);

  // const startChat = (otherUser: any) => {
  //   const chatId = [currentUid, otherUser.uid].sort().join('_');
  //   navigation.navigate('Chat', { chatId, otherUser });
  // };
  const startChat = async (otherUser: any) => {
    try {
      const currentUid = currentUser()?.uid;
      const chatId = getChatId(currentUid, otherUser.uid);

      // Show loading indicator
      console.log('Creating chat document...');

      // Create chat document BEFORE navigating and WAIT for it
      await initializeChatDoc(chatId, [currentUid, otherUser.uid], false);

      console.log('Chat document created:', chatId);

      // Navigate after document is created
      navigation.navigate('Chat', {
        chatId,
        otherUser,
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      // You might want to show an alert here
    }
  };
  const openProfile = (otherUser: any) =>
    navigation.navigate('UserProfile', { userId: otherUser.uid });

  if (loading) {
    return (
      <View
        style={[globalStyles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 🟢 Active Users (online)
  const activeUsers = users.filter(u => u.isOnline);

  return (
    <Layout>
      {/* <Header title="Match Your Vibe 🎉" /> */}

      <View
        style={{
          marginHorizontal: 15,
          marginTop: 10,
          padding: 15,
          borderRadius: 16,
          backgroundColor: colors.primary,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff',
          }}
        >
          Match Your Vibe 🎉
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'normal',
            color: '#bdb5b5ff',
            fontStyle: 'italic',
          }}
        >
          A open world of connections
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          placeholder="Search conversations..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {['all', 'online', 'recent'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterBtn,
              filter === type && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === type && { color: '#fff', fontWeight: '700' },
              ]}
            >
              {type === 'all' ? 'All' : type === 'online' ? 'Online' : 'Recent'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Now */}
      {activeUsers.length > 0 && (
        <View style={styles.activeNowContainer}>
          <Text style={styles.sectionTitle}>Active Now</Text>
          <FlatList
            data={activeUsers}
            horizontal
            keyExtractor={item => item.uid}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => startChat(item)}
                style={styles.activeUserCard}
              >
                <Image
                  source={{ uri: item.photoURL || defaultAvatar }}
                  style={styles.activeAvatar}
                />
                <View style={styles.onlineDot} />
                <Text style={styles.activeName}>
                  {item.name?.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* User List */}
      <FlatList
        data={filteredUsers}
        // style={{ marginBottom: 2 }}
        keyExtractor={item => item.uid}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found 👀</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userRow}>
              <Image
                source={{ uri: item.photoURL || defaultAvatar }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.statusText}>
                  {item.isOnline
                    ? '🟢 Online'
                    : `Last seen ${formatLastSeen(item.lastSeen)}`}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.msgBtn}
                onPress={() => startChat(item)}
              >
                <Text style={styles.btnText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => openProfile(item)}
              >
                <Text style={[styles.btnText, { color: colors.primary }]}>
                  View
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, color: colors.text },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  filterBtn: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 5,
  },
  filterText: { color: colors.primary, fontWeight: '500' },
  activeNowContainer: { marginVertical: 10, paddingLeft: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  activeUserCard: { marginRight: 15, alignItems: 'center' },
  activeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
  },
  onlineDot: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#fff',
  },
  activeName: { fontSize: 12, color: colors.text },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  userName: { fontSize: 17, fontWeight: 'bold', color: colors.text },
  userEmail: { fontSize: 13, color: colors.textSecondary },
  statusText: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  msgBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  viewBtn: {
    flex: 1,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 5,
  },
  btnText: { fontWeight: '600', fontSize: 14, color: '#fff' },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 50,
  },
});

export default UsersScreen;

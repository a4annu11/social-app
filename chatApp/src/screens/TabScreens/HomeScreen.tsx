import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import {
  usersRef,
  currentUser,
  signOut,
  fetchUserChats,
  fetchUserGroups,
  getUserActivityStats,
  fetchSuggestedFriends,
  getChatStreak,
  getChatId,
  initializeChatDoc,
} from '../../services/firebase';
import { globalStyles, colors } from '../../utils/styles';
import Layout from '../Layout';
import { formatLastSeen } from '../../utils/time';

const HomeScreen = () => {
  const navigation: any = useNavigation();
  const currentUid = currentUser()?.uid;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    chats: 0,
    groups: 0,
    friends: 0,
  });
  const [activity, setActivity] = useState({
    messagesSent: 0,
    messagesReceived: 0,
    groupsJoined: 0,
  });

  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadExtras = async () => {
      if (!currentUid) return;
      try {
        const [friends, streakValue] = await Promise.all([
          fetchSuggestedFriends(currentUid),
          getChatStreak(currentUid),
        ]);
        setSuggestedFriends(friends);
        setStreak(streakValue);
      } catch (e) {
        console.error('Error loading extras:', e);
      }
    };
    loadExtras();
  }, [currentUid]);

  console.log('STREAK', streak);

  // 🔹 Load user info
  useEffect(() => {
    if (!currentUid) return;
    const unsubscribe = usersRef()
      .doc(currentUid)
      .onSnapshot(doc => {
        if (doc.exists) setUser({ id: doc.id, ...doc.data() });
      });
    return unsubscribe;
  }, [currentUid]);

  // 🔹 Load stats and activity
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userChats, userGroups, usersSnap, activityStats] =
          await Promise.all([
            fetchUserChats(currentUid),
            fetchUserGroups(currentUid),
            usersRef().get(),
            getUserActivityStats(currentUid),
          ]);

        const friendsCount = usersSnap.size - 1;
        setStats({
          chats: userChats.length,
          groups: userGroups.length,
          friends: friendsCount,
        });

        setActivity(activityStats);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUid]);

  const handleLogout = async () => await signOut();

  const goToUsers = () => navigation.navigate('Users');
  const goToProfile = () => navigation.navigate('Profile');

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

  if (loading) {
    return (
      <View
        style={[globalStyles.center, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Image
              source={{
                uri:
                  user?.photoURL ||
                  'https://cdn-icons-png.flaticon.com/512/147/147144.png',
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>
                Hey, {user?.name || 'User'} 👋
              </Text>
              <Text
                style={[
                  styles.status,
                  {
                    color: user?.isOnline
                      ? colors.success
                      : colors.textSecondary,
                  },
                ]}
              >
                {user?.isOnline
                  ? 'Online now'
                  : `Last seen ${formatLastSeen(user?.lastSeen)}`}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
            <Icon name="logout" size={20} color={'white'} />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.chats}</Text>
            <Text style={styles.statLabel}>Active Chats</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.groups}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.friends}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>

        {/* Activity Section */}
        {/* <Text style={styles.sectionTitle}>Your Activity</Text> */}
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Text style={styles.activityValue}>{activity.messagesSent}</Text>
            <Text style={styles.activityLabel}>Messages Sent</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityValue}>
              {activity.messagesReceived}
            </Text>
            <Text style={styles.activityLabel}>Messages Received</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityValue}>{activity.groupsJoined}</Text>
            <Text style={styles.activityLabel}>Groups Joined</Text>
          </View>
        </View>

        {/* Chat Streak */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakText}>
              {streak > 0
                ? `You're on a ${streak}-day chat streak!`
                : 'Start chatting to build your streak!'}
            </Text>
            {streak > 0 && (
              <Text style={styles.streakSubText}>Keep it going 💪</Text>
            )}
          </View>
        </View>

        {/* Suggested Friends */}
        {suggestedFriends.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>People You May Know</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestedScroll}
            >
              {suggestedFriends.map(user => (
                <View key={user.id} style={styles.suggestedCard}>
                  <Image
                    source={{
                      uri:
                        user?.photoURL ||
                        'https://cdn-icons-png.flaticon.com/512/147/147144.png',
                    }}
                    style={styles.suggestedAvatar}
                  />
                  <Text style={styles.suggestedName} numberOfLines={1}>
                    {user.name || 'Unknown'}
                  </Text>
                  <TouchableOpacity
                    style={styles.suggestedButton}
                    onPress={() => startChat(user)}
                  >
                    <Text style={styles.suggestedButtonText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={goToUsers}>
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.actionLabel}>Start Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Groups')}
          >
            <Text style={styles.actionEmoji}>👥</Text>
            <Text style={styles.actionLabel}>Groups</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={goToProfile}>
            <Text style={styles.actionEmoji}>⚙️</Text>
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <Text style={styles.sectionTitle}>Account Info</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            📅 Joined: {user?.createdAt?.toDate?.().toLocaleDateString() || '—'}
          </Text>
          <Text style={styles.infoText}>
            🕒 Last Login: {formatLastSeen(user?.lastSeen)}
          </Text>
          <Text style={styles.infoText}>
            💌 Email: {user?.email || 'No email'}
          </Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  greeting: { color: '#fff', fontSize: 18, fontWeight: '600' },
  status: { color: '#fff', fontSize: 14, marginTop: 4 },
  logoutText: { color: '#fff', fontWeight: '600' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
  },
  actionEmoji: { fontSize: 28, marginBottom: 5 },
  actionLabel: { fontSize: 14, fontWeight: '500', color: colors.text },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    elevation: 2,
  },
  activityItem: { alignItems: 'center' },
  activityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  activityLabel: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    elevation: 2,
    marginBottom: 20,
  },
  infoText: { color: colors.text, fontSize: 14, marginVertical: 4 },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    marginBottom: 25,
  },
  streakEmoji: { fontSize: 36, marginRight: 12 },
  streakText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  streakSubText: { color: colors.textSecondary, marginTop: 2, fontSize: 13 },

  suggestedScroll: { marginBottom: 25 },
  suggestedCard: {
    width: 110,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 15,
    marginRight: 12,
    elevation: 2,
  },
  suggestedAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  suggestedName: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  suggestedButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 6,
  },
  suggestedButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});

export default HomeScreen;

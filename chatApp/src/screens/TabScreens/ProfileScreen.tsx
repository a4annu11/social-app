import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  usersRef,
  currentUser,
  serverTimestamp,
  fetchUserChats,
  fetchUserGroups,
  signOut,
} from '../../services/firebase';
import { globalStyles, colors } from '../../utils/styles';
import Layout from '../Layout';
import { formatLastSeen } from '../../utils/time';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ chats: 0, groups: 0, friends: 0 });
  const [completion, setCompletion] = useState(0);
  const uid = currentUser()?.uid;

  useEffect(() => {
    if (uid) {
      const unsubscribe = usersRef()
        .doc(uid)
        .onSnapshot(doc => {
          if (doc.exists) {
            const userData = doc.data();
            setUser(userData);
            calculateCompletion(userData);
            setLoading(false);
          }
        });
      return unsubscribe;
    }
  }, [uid]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!uid) return;
      const [chats, groups] = await Promise.all([
        fetchUserChats(uid),
        fetchUserGroups(uid),
      ]);
      setStats({
        chats: chats.length,
        groups: groups.length,
        friends: Math.floor(chats.length * 1.5), // Example logic
      });
    };
    fetchStats();
  }, [uid]);

  const calculateCompletion = (userData: any) => {
    let fields = ['name', 'bio', 'photoURL'];
    let filled = fields.filter(f => !!userData[f]).length;
    setCompletion(Math.round((filled / fields.length) * 100));
  };

  const saveProfile = async () => {
    if (!user.name) return Alert.alert('Error', 'Name required');
    await usersRef()
      .doc(uid)
      .update({
        name: user.name,
        bio: user.bio || '',
        lastSeen: serverTimestamp(),
      });
    setEditing(false);
    Alert.alert('Success', 'Profile updated!');
  };

  const handleLogout = async () => {
    await signOut();
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
    <Layout statusBarColor={colors.primary}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <LinearGradient
          colors={[colors.primary, '#7b68ee']}
          style={styles.profileHeader}
        >
          <TouchableOpacity
            disabled={!editing}
            style={styles.avatarWrapper}
            onPress={() => Alert.alert('Upload photo coming soon!')}
          >
            <Image
              source={{
                uri:
                  user?.photoURL ||
                  'https://cdn-icons-png.flaticon.com/512/147/147144.png',
              }}
              style={styles.avatar}
            />
            {editing && (
              <View style={styles.editIcon}>
                <Icon name="edit" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.status}>
            {user?.isOnline
              ? '🟢 Online'
              : `Last seen ${formatLastSeen(user?.lastSeen)}`}
          </Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.chats}</Text>
            <Text style={styles.statLabel}>Chats</Text>
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

        {/* Profile Completion */}
        <View style={styles.completionCard}>
          <Text style={styles.completionText}>
            Profile {completion}% complete
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={user?.name || ''}
            editable={editing}
            onChangeText={text => setUser({ ...user, name: text })}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#eee' }]}
            value={user?.email || ''}
            editable={false}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={user?.bio || ''}
            editable={editing}
            onChangeText={text => setUser({ ...user, bio: text })}
            multiline
          />

          <Text style={styles.label}>Joined</Text>
          <Text style={styles.joinedText}>
            {user?.createdAt
              ? new Date(user.createdAt.seconds * 1000).toDateString()
              : '—'}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          {editing ? (
            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.secondary }]}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.btnText}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.error }]}
            onPress={handleLogout}
          >
            <Text style={styles.btnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 5,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  status: { fontSize: 14, color: '#eee' },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 100,
    alignItems: 'center',
    paddingVertical: 15,
    elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 13, color: colors.textSecondary },

  completionCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  completionText: { color: colors.text, fontWeight: '600', marginBottom: 8 },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  label: { color: colors.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  joinedText: { color: colors.text },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default ProfileScreen;

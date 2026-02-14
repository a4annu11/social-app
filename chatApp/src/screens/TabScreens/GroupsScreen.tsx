import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  DeviceEventEmitter,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  groupsRef,
  joinGroup,
  leaveGroup,
  deleteGroup,
  currentUser,
  usersRef,
} from '../../services/firebase';
import { globalStyles, colors } from '../../utils/styles';
import Header from '../../components/Header';
import Layout from '../Layout';
import { showSuccess } from '../../utils/ToastMessage';

const categoryTabs = [
  { label: 'All', value: 'all' },
  { label: 'Sports', value: 'sports' },
  { label: 'Study', value: 'study' },
  { label: 'Music', value: 'music' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Movies', value: 'movies' },
  { label: 'Technology', value: 'tech' },
  { label: 'Travel', value: 'travel' },
  { label: 'Other', value: 'other' },
];

const GroupsScreen = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    isDestructive: false,
  });
  const navigation: any = useNavigation();
  const user: any = currentUser();
  const currentUid = user?.uid;
  const uid = currentUser()?.uid;
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔹 Fetch Admin Info
  useEffect(() => {
    if (uid) {
      const unsubscribe = usersRef()
        .doc(uid)
        .onSnapshot(doc => {
          if (doc.exists) {
            const userData = doc.data();
            setIsAdmin(userData?.isAdmin || false);
            setLoading(false);
          }
        });
      return unsubscribe;
    }
  }, [uid]);

  // 🔹 Fetch Groups
  useEffect(() => {
    const unsubscribe = groupsRef().onSnapshot(snapshot => {
      const groupList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupList);
      setFiltered(groupList);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔹 Filter by search + category
  useEffect(() => {
    let f = groups.filter(g =>
      g.name?.toLowerCase().includes(search.toLowerCase()),
    );

    if (selectedCategory !== 'all') {
      f = f.filter(g => g.category === selectedCategory);
    }

    setFiltered(f);
  }, [search, groups, selectedCategory]);

  // 🔹 Join / Leave / Delete
  const handleJoinAndOpen = async (groupId: string, group: any) => {
    try {
      await joinGroup(groupId, currentUid);
      showSuccess('Joined Group');
      openGroupChat(group);
      await DeviceEventEmitter.emit('refreshConversations');
    } catch (error: any) {
      // You might want to show an error modal here as well
      console.error('Error joining group:', error.message);
    }
  };

  const confirmLeave = (groupId: string) => {
    setModalConfig({
      title: 'Leave Group',
      message: 'Are you sure you want to leave this group?',
      confirmText: 'Leave',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await leaveGroup(groupId, currentUid);
          showSuccess('Left Group');
          await DeviceEventEmitter.emit('refreshConversations');
        } catch (error: any) {
          console.error('Error leaving group:', error.message);
        }
      },
    });
    setModalVisible(true);
  };

  const confirmDelete = (groupId: string, name: string) => {
    setModalConfig({
      title: 'Delete Group',
      message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteGroup(groupId, currentUid);
          await DeviceEventEmitter.emit('refreshConversations');
        } catch (error: any) {
          console.error('Error deleting group:', error.message);
        }
      },
    });
    setModalVisible(true);
  };

  const openGroupChat = (group: any) => {
    navigation.navigate('Chat', { chatId: group.id, group });
  };

  const confirmJoin = (group: any) => {
    setModalConfig({
      title: 'Join Group?',
      message: `Join "${group.name}" to start chatting?`,
      confirmText: 'Join',
      isDestructive: false,
      onConfirm: () => handleJoinAndOpen(group.id, group),
    });
    setModalVisible(true);
  };

  const handleGroupPress = (group: any) => {
    const isMember = group.members?.includes(currentUid);
    if (isMember) {
      openGroupChat(group);
    } else {
      confirmJoin(group);
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
      <View style={globalStyles.container}>
        {/* Header */}
        {/* <Header
          title="Have fun together in groups!"
          onRightPress={
            isAdmin ? () => navigation.navigate('CreateGroup') : undefined
          }
        /> */}

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
            Have fun together in groups!🎉
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'normal',
              color: '#bdb5b5ff',
              fontStyle: 'italic',
            }}
          >
            Join groups to chat with your friends!
          </Text>
        </View>

        {/* 🔹 Category Tabs */}

        <View style={{ marginVertical: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryBar}
          >
            {categoryTabs.map(tab => (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setSelectedCategory(tab.value)}
                style={[
                  styles.categoryTab,
                  selectedCategory === tab.value && styles.categoryTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === tab.value && styles.categoryTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 🔹 Search Bar */}
        <View style={styles.searchBox}>
          <Icon name="magnify" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Search groups..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* 🔹 Group List */}
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => {
            const isMember = item.members?.includes(currentUid);
            const canDelete = item.createdBy === currentUid || isAdmin;

            return (
              <TouchableOpacity
                onPress={() => handleGroupPress(item)}
                onLongPress={() =>
                  canDelete && confirmDelete(item.id, item.name)
                }
                style={styles.groupCard}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrapper}>
                  <Icon name="account-group" size={28} color="#fff" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupDesc} numberOfLines={1}>
                    {item.description || 'No description'}
                  </Text>
                  <Text style={styles.groupMembers}>
                    👥 {item.members?.length || 0} members
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    isMember
                      ? confirmLeave(item.id)
                      : handleJoinAndOpen(item.id, item);
                  }}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isMember ? colors.error : colors.success,
                    },
                  ]}
                >
                  <Text style={styles.actionText}>
                    {isMember ? 'Leave' : 'Join'}
                  </Text>
                </TouchableOpacity>

                {canDelete && (
                  <TouchableOpacity
                    onPress={e => {
                      e.stopPropagation();
                      confirmDelete(item.id, item.name);
                    }}
                    style={styles.deleteBtn}
                  >
                    <Icon name="delete" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              💬 No groups found in this category.
            </Text>
          }
        />

        {/* 🔹 Floating Create Button */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Icon name="plus" size={26} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Confirmation Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalConfig.title}</Text>
              <Text style={styles.modalMessage}>{modalConfig.message}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    modalConfig.isDestructive && {
                      backgroundColor: colors.error,
                    },
                  ]}
                  onPress={() => {
                    modalConfig.onConfirm();
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      {
                        color: modalConfig.isDestructive
                          ? '#fff'
                          : colors.primary,
                        fontWeight: 'bold',
                      },
                    ]}
                  >
                    {modalConfig.confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  categoryBar: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    // height: 50,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 10,
    // height: 40,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: { flex: 1, marginLeft: 8, color: colors.text },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  groupName: { fontSize: 16, fontWeight: '600', color: colors.text },
  groupDesc: { fontSize: 13, color: colors.textSecondary },
  groupMembers: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  actionBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  deleteBtn: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 6,
    marginLeft: 6,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});

export default GroupsScreen;

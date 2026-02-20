import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  fetchUserChats,
  getLastMessage,
  getUnreadCountFast,
  markAsRead,
  currentUser,
  usersRef,
  chatsRef,
  chatDocRef,
} from '../../services/firebase';
import { globalStyles, colors } from '../../utils/styles';
import { formatLastSeen } from '../../utils/time';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import firestore from '@react-native-firebase/firestore';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MessagesScreen = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation: any = useNavigation();
  const currentUid = currentUser()?.uid;
  const insets = useSafeAreaInsets();

  // Use ref to track processed chat IDs to avoid duplicates
  const processedChatIds = useRef<Set<string>>(new Set());

  // Track typing status for each conversation
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  // Force re-render every minute to update "just now" → "1 min ago" etc.
  const [, setTick] = useState(0);

  // Update timestamps every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let f = conversations.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()),
    );

    setFiltered(f);
  }, [search, conversations]);

  // Helper function to get the last visible message for the current user
  const getLastVisibleMessage = async (chatId: string) => {
    try {
      const messagesRef = chatsRef(chatId);

      // Get recent messages (not just 1, in case some are deleted for this user)
      const snapshot = await messagesRef
        .orderBy('timestamp', 'desc')
        .limit(5) // Get last 5 to find one that's not deleted for current user
        .get();

      if (snapshot.empty) {
        return null;
      }

      // Find the first message that's not deleted for current user
      for (const doc of snapshot.docs) {
        const data = doc.data();

        // Check if message is deleted for current user
        const isDeletedForMe = data.deletedFor && data.deletedFor[currentUid];

        // Skip if deleted for current user (but not globally deleted)
        if (isDeletedForMe && !data.deletedGlobally) {
          continue;
        }

        // This is the first visible message for current user
        return data;
      }

      // All messages are deleted for current user
      return null;
    } catch (error) {
      console.error('Error getting last visible message:', error);
      return null;
    }
  };

  const enrichConversation = async (conv: any) => {
    let lastMsg = null;
    let unread = 0;
    let title = conv.name || 'Unknown';

    try {
      // Use the new function to get last visible message
      lastMsg = await getLastVisibleMessage(conv.id);
      unread = await getUnreadCountFast(conv.id, currentUid);

      console.log('LastMSG', lastMsg);

      if (!conv.participants || conv.participants.length !== 2) {
        console.error('Invalid participants in conversation:', conv.id);
        return null; // Skip invalid conversations
      }

      const otherUid = conv.participants.find((p: string) => p !== currentUid);
      if (!otherUid) {
        console.error('No other UID found in conversation:', conv.id);
        return null;
      }

      const otherDoc = await usersRef().doc(otherUid).get();
      const otherUser = otherDoc.exists ? otherDoc.data() : null;
      title = otherUser?.name || 'Unknown User';
    } catch (error) {
      console.error('Error enriching conversation:', error);
      return null;
    }

    let preview = 'No messages yet';
    if (lastMsg) {
      if (lastMsg.deletedGlobally) {
        preview = 'This message was deleted';
      } else {
        preview = lastMsg.text
          ? `${lastMsg.text.substring(0, 30)}${
              lastMsg.text.length > 30 ? '...' : ''
            }`
          : 'No messages yet';
      }
    } else {
      // No visible messages - either chat is cleared or all messages deleted
      preview = 'No messages';
    }

    return {
      ...conv,
      title,
      preview,
      timestamp: lastMsg?.timestamp || null,
      unreadCount: unread,
    };
  };

  const loadConversations = async () => {
    if (!currentUid) return;

    try {
      setLoading(true);
      console.log('📥 Loading conversations for user:', currentUid);

      const chats = await fetchUserChats(currentUid);

      console.log('💬 Fetched chats:', chats.length);

      const allConv = [...chats];

      console.log('🔖 Marking chats as processed...');
      // Mark all as processed
      allConv.forEach(conv => {
        console.log('  - Processing chat:', conv.id);
        processedChatIds.current.add(conv.id);
      });

      console.log('📊 Total processed IDs:', processedChatIds.current.size);

      const enrichedPromises = allConv.map(conv => enrichConversation(conv));
      const enriched = (await Promise.all(enrichedPromises)).filter(
        conv => conv !== null,
      );

      enriched.sort((a, b) => {
        const aTime = a.timestamp ? a.timestamp.toMillis() : -Infinity;
        const bTime = b.timestamp ? b.timestamp.toMillis() : -Infinity;
        return bTime - aTime;
      });

      setConversations(enriched);
      setFiltered(enriched);

      console.log('✅ Conversations loaded:', enriched.length);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load conversations only once on mount
  useEffect(() => {
    loadConversations();
  }, [currentUid]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'refreshConversations',
      () => {
        console.log('Received refreshConversations event, reloading...');
        loadConversations();
      },
    );

    return () => {
      subscription.remove();
    };
  }, [loadConversations]);

  const updateConversationLocally = useCallback(
    (convId: string, updates: any) => {
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv.id === convId ? { ...conv, ...updates } : conv,
        );
        return updated.sort((a, b) => {
          const aTime = a.timestamp ? a.timestamp.toMillis() : -Infinity;
          const bTime = b.timestamp ? b.timestamp.toMillis() : -Infinity;
          return bTime - aTime;
        });
      });
    },
    [],
  );

  const addNewConversation = useCallback(
    async (convData: any) => {
      try {
        // Check if already processed using ref
        if (processedChatIds.current.has(convData.id)) {
          console.log(
            '⏭️ Conversation already in processedChatIds, skipping:',
            convData.id,
          );
          return;
        }

        console.log('➕ Adding new conversation:', convData.id);
        processedChatIds.current.add(convData.id);

        console.log('🔄 Enriching conversation...');
        const enriched = await enrichConversation(convData);
        if (!enriched) {
          console.log('Skipping invalid new conversation:', convData.id);
          return;
        }
        console.log('✅ Enriched:', enriched.title);

        setConversations(prev => {
          // Double-check it doesn't exist in state
          const exists = prev.some(c => c.id === convData.id);
          if (exists) {
            console.log(
              '⚠️ Conversation already in state, skipping:',
              convData.id,
            );
            return prev;
          }

          console.log(
            '📋 Adding to conversations list. Current count:',
            prev.length,
          );

          // Add new conversation
          const updated = [...prev, enriched];
          const sorted = updated.sort((a, b) => {
            const aTime = a.timestamp ? a.timestamp.toMillis() : -Infinity;
            const bTime = b.timestamp ? b.timestamp.toMillis() : -Infinity;
            return bTime - aTime;
          });

          console.log('✅ New conversations count:', sorted.length);
          return sorted;
        });
      } catch (error) {
        console.error('❌ Error adding new conversation:', error);
      }
    },
    [currentUid],
  );

  useEffect(() => {
    if (!currentUid) return;
    const unsubscribers: (() => void)[] = [];

    const setupRealtimeListeners = () => {
      try {
        // Listen for NEW chats being created - this is the key listener
        console.log(
          '🎧 Setting up listener for chats with participant:',
          currentUid,
        );

        const unsubNewChats = firestore()
          .collection('chats')
          .where('participants', 'array-contains', currentUid)
          .onSnapshot(
            snapshot => {
              console.log(
                '📨 Chat snapshot received, changes:',
                snapshot.docChanges().length,
              );

              snapshot.docChanges().forEach(change => {
                console.log(
                  `  - Change type: ${change.type}, doc: ${change.doc.id}`,
                );

                if (change.type === 'added') {
                  const chatData = {
                    id: change.doc.id,
                    ...change.doc.data(),
                    type: 'chat',
                  };

                  console.log(
                    '  - Chat data:',
                    JSON.stringify(chatData, null, 2),
                  );
                  console.log(
                    '  - Already processed?',
                    processedChatIds.current.has(chatData.id),
                  );

                  // Use ref for immediate check
                  if (!processedChatIds.current.has(chatData.id)) {
                    console.log('🔔 New chat detected, adding:', chatData.id);
                    addNewConversation(chatData);

                    // Setup listeners for the new chat
                    setupChatListeners(chatData.id, unsubscribers);
                  } else {
                    console.log(
                      '⏭️ Skipping already processed chat:',
                      chatData.id,
                    );
                  }
                }
              });
            },
            error => {
              console.error('❌ New chats listener error:', error);
            },
          );

        unsubscribers.push(unsubNewChats);

        // Setup listeners for existing conversations
        conversations.forEach(conv => {
          setupChatListeners(conv.id, unsubscribers);
        });
      } catch (e) {
        console.error('Setup listeners error:', e);
      }
    };

    const setupChatListeners = (
      chatId: string,
      unsubscribers: (() => void)[],
    ) => {
      const messagesRef = chatsRef(chatId);

      // Listen to all messages to handle deleted/cleared cases
      const unsubMsg = messagesRef
        .orderBy('timestamp', 'desc')
        .limit(5) // Get more messages to handle deletion cases
        .onSnapshot(async snapshot => {
          // Find first message that's not deleted for current user
          let lastVisibleMsg = null;

          for (const doc of snapshot.docs) {
            const data = doc.data();
            const isDeletedForMe =
              data.deletedFor && data.deletedFor[currentUid];

            if (!isDeletedForMe || data.deletedGlobally) {
              lastVisibleMsg = data;
              break;
            }
          }

          let preview = 'No messages';
          let timestamp = null;

          if (lastVisibleMsg) {
            timestamp = lastVisibleMsg.timestamp;
            if (lastVisibleMsg.deletedGlobally) {
              preview = 'This message was deleted';
            } else {
              preview = lastVisibleMsg.text
                ? `${lastVisibleMsg.text.substring(0, 30)}${
                    lastVisibleMsg.text.length > 30 ? '...' : ''
                  }`
                : 'No messages';
            }
          }

          updateConversationLocally(chatId, { preview, timestamp });
        });

      const docRef = chatDocRef(chatId);

      const unsubChat = docRef.onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          const unread = data?.unreadCount?.[currentUid] || 0;
          updateConversationLocally(chatId, { unreadCount: unread });

          // Check typing status
          const typingBy = data?.typingBy || [];
          const isOtherTyping = typingBy.some(uid => uid !== currentUid);

          setTypingStatus(prev => ({
            ...prev,
            [chatId]: isOtherTyping,
          }));
        }
      });

      unsubscribers.push(unsubMsg, unsubChat);
    };

    setupRealtimeListeners();

    return () => {
      console.log('Cleaning up listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUid, updateConversationLocally, addNewConversation]);

  const openConversation = async (conv: any) => {
    try {
      updateConversationLocally(conv.id, { unreadCount: 0 });
      markAsRead(conv.id, currentUid).catch(() => {});

      if (!conv.participants || conv.participants.length !== 2) {
        console.error('Invalid participants in conversation:', conv.id);
        return;
      }

      const otherUid = conv.participants.find((p: string) => p !== currentUid);
      if (!otherUid) {
        console.error('No other UID found in conversation:', conv.id);
        return;
      }

      const otherDoc = await usersRef().doc(otherUid).get();
      let otherUser;
      if (otherDoc.exists) {
        otherUser = { uid: otherUid, ...otherDoc.data() };
      } else {
        console.warn('Other user document not found:', otherUid);
        otherUser = {
          uid: otherUid,
          name: 'Unknown',
          isOnline: false,
          lastSeen: null,
          // Add other required fields if needed
        };
      }

      navigation.navigate('Chat', { chatId: conv.id, otherUser });
    } catch (error) {
      console.error('Error opening conversation:', error);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  console.log('FILTERED', filtered);
  return (
    <Layout paddingTop={insets.top}>
      <View style={[{ flex: 1 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Users')}>
            <Icon name="account-plus" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
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

        {/* Conversations */}
        <FlatList
          data={filtered}
          keyExtractor={(item: any, index: number) => `${item.id}-${index}`}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              onPress={() => openConversation(item)}
              style={styles.chatCard}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <Icon name="account" size={26} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.chatTop}>
                  <Text style={styles.chatName}>{item.title}</Text>
                  <Text style={styles.chatTime}>
                    {item.timestamp ? formatLastSeen(item.timestamp) : ''}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chatPreview,
                    {
                      color: typingStatus[item.id]
                        ? colors.primary
                        : item.unreadCount > 0
                        ? 'black'
                        : colors.textSecondary,
                      fontWeight: item.unreadCount > 0 ? 'bold' : 'normal',
                      fontStyle:
                        typingStatus[item.id] || item.unreadCount > 0
                          ? 'italic'
                          : 'normal',
                    },
                  ]}
                >
                  {typingStatus[item.id] ? '✍️ typing...' : item.preview}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              💬 No conversations yet. Start chatting!
            </Text>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Users')}
        >
          <Icon name="message-plus" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
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
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  iconWrap: {
    backgroundColor: colors.primary,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatName: { fontSize: 16, fontWeight: '600', color: colors.text },
  chatTime: { fontSize: 12, color: colors.textSecondary },
  chatPreview: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    position: 'absolute',
    right: 20,
    bottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
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
    elevation: 6,
  },
});

export default MessagesScreen;

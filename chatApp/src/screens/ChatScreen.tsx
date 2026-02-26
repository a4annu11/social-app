import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
  Alert,
  TouchableWithoutFeedback,
  StatusBar,
  DeviceEventEmitter,
  Modal,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import CancelIcon from 'react-native-vector-icons/MaterialIcons';
import MessageDeleteIcon from 'react-native-vector-icons/Entypo';
import Layout from './Layout';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import {
  chatsRef,
  serverTimestamp,
  currentUser,
  chatDocRef,
  updateTypingStatus,
  markAsRead,
  incrementUnreadCount,
  initializeChatDoc,
  blockUser,
  unblockUser,
  clearChatForUser,
} from '../services/firebase';
import { usersRef } from '../services/firebase';
import { formatLastSeen } from '../utils/time';
import firestore from '@react-native-firebase/firestore';
import { MenuProvider } from 'react-native-popup-menu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../theme';

const REACTIONS = ['❤️', '😂', '😮', '😢', '🙏', '👍'];

// Helper function to format date labels
const getDateLabel = (timestamp: any) => {
  if (!timestamp) return '';

  const messageDate = timestamp.toDate();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time to compare only dates
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  const msgDate = new Date(messageDate);
  msgDate.setHours(0, 0, 0, 0);

  if (msgDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (msgDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
};

// Helper function to check if two messages are on different days
const isDifferentDay = (timestamp1: any, timestamp2: any) => {
  if (!timestamp1 || !timestamp2) return false;

  const date1 = timestamp1.toDate();
  const date2 = timestamp2.toDate();

  return (
    date1.getDate() !== date2.getDate() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getFullYear() !== date2.getFullYear()
  );
};

const ChatScreen = () => {
  const route = useRoute();
  const { chatId, otherUser }: any = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUid: any = currentUser()?.uid;
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [selectedMessageForMenu, setSelectedMessageForMenu] =
    useState<any>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [messagePosition, setMessagePosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [headerHeight, setHeaderHeight] = useState(0);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [otherBlockedUsers, setOtherBlockedUsers] = useState<string[]>([]);
  const messageRefs = useRef<{ [key: string]: any }>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [bottomHeight, setBottomHeight] = useState(80);
  const insests = useSafeAreaInsets();
  const { colors }: any = useTheme();

  const allParticipants = [currentUid, otherUser.uid];

  const isBlocked = useMemo(
    () => blockedUsers.includes(otherUser?.uid || ''),
    [blockedUsers, otherUser?.uid],
  );

  const canSend = useMemo(
    () => !otherBlockedUsers.includes(currentUid),
    [otherBlockedUsers, currentUid],
  );

  useEffect(() => {
    if (!currentUid) return;

    const unsubMyBlocks = usersRef()
      .doc(currentUid)
      .onSnapshot(doc => {
        setBlockedUsers(doc.data()?.blockedUsers || []);
      }, console.error);

    return () => unsubMyBlocks();
  }, [currentUid]);

  useEffect(() => {
    if (!otherUser?.uid || !currentUid) return;

    const unsubOtherBlocks = usersRef()
      .doc(otherUser.uid)
      .onSnapshot(doc => {
        setOtherBlockedUsers(doc.data()?.blockedUsers || []);
      }, console.error);

    return () => unsubOtherBlocks();
  }, [otherUser?.uid, currentUid]);

  useEffect(() => {
    if (!chatId || !currentUid) return;

    let unsubscribe: any;

    const setupChat = async () => {
      try {
        await initializeChatDoc(chatId, allParticipants);

        const ref = chatsRef(chatId);
        unsubscribe = ref.orderBy('timestamp', 'asc').onSnapshot(
          async querySnapshot => {
            const msgList: any = [];
            querySnapshot.forEach(doc => {
              const data = doc.data();
              if (
                data.deletedFor &&
                data.deletedFor[currentUid] &&
                !data.deletedGlobally
              ) {
                return;
              }
              msgList.push({ id: doc.id, ...data });
            });
            setMessages(msgList);
            setLoading(false);
            setTimeout(
              () => flatListRef.current?.scrollToEnd({ animated: true }),
              300,
            );

            await markAsRead(chatId, currentUid).catch(console.error);
          },
          error => {
            console.error('Chat listen error:', error);
            setLoading(false);
          },
        );
      } catch (error) {
        console.error('Setup chat error:', error);
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, currentUid, blockedUsers]);

  useEffect(() => {
    if (!chatId || !currentUid) return;

    const docRef = chatDocRef(chatId);

    const typingUnsub = docRef.onSnapshot(async (doc: any) => {
      if (doc.exists) {
        const typingBy = doc.data()?.typingBy || [];
        const otherTypingUids = typingBy.filter(
          (uid: any) => uid === otherUser.uid && uid !== currentUid,
        );

        const hasOtherTyping = otherTypingUids.length > 0;
        setIsOtherTyping(hasOtherTyping);
      }
    });

    return () => {
      typingUnsub();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [chatId, otherUser?.uid, currentUid]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  const handleInputChange = (newText: string) => {
    setText(newText);
    if (newText.trim() && !isTyping) {
      setIsTyping(true);
      updateTypingStatus(chatId, currentUid, true);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(chatId, currentUid, false);
    }, 1500);
  };

  const handleLongPress = useCallback((item: any) => {
    setSelectedMessageForMenu(item);
    const ref = messageRefs.current[item.id];
    if (ref) {
      ref.measureInWindow((x, y, width, height) => {
        setMessagePosition({ x, y, width, height });
        setShowReactionPicker(true);
      });
    } else {
      setShowReactionPicker(true);
    }
  }, []);

  const closeMessageMenu = () => {
    setSelectedMessageForMenu(null);
    setShowReactionPicker(false);
  };

  const handleReply = useCallback((item: any) => {
    setReplyingTo(item);
    closeMessageMenu();
  }, []);

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleEdit = useCallback(
    (item: any) => {
      if (item.senderUid !== currentUid) {
        Alert.alert('Error', 'You can only edit your own messages.');
        return;
      }
      setEditingMessageId(item.id);
      setText(item.text);
      closeMessageMenu();
    },
    [currentUid],
  );

  const handleDelete = useCallback(
    (messageId: any, senderUid: string) => {
      if (senderUid !== currentUid) {
        Alert.alert('Error', 'You can only delete your own messages.');
        return;
      }
      setSelectedMessageId(messageId);
      closeMessageMenu();
      setShowDeleteModal(true);
    },
    [currentUid],
  );

  const handleReaction = async (emoji: string) => {
    if (!selectedMessageForMenu) return;

    try {
      const ref = chatsRef(chatId);
      const messageRef = ref.doc(selectedMessageForMenu.id);

      const currentReactions = selectedMessageForMenu.reactions || {};

      // Check if user already reacted with this emoji
      if (currentReactions[currentUid] === emoji) {
        // Remove reaction
        await messageRef.update({
          [`reactions.${currentUid}`]: null,
        });
      } else {
        // Add or update reaction (one reaction per user)
        await messageRef.update({
          [`reactions.${currentUid}`]: emoji,
        });
      }

      closeMessageMenu();
    } catch (error) {
      console.error('Reaction error:', error);
      Alert.alert('Error', 'Failed to add reaction.');
    }
  };

  const sendMessage = async () => {
    if (!canSend) {
      Alert.alert(
        'Blocked',
        'This user has blocked you. You cannot send messages.',
      );
      return;
    }
    if (!text.trim()) return;
    const messageText = text.trim();
    setText('');
    setIsTyping(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    updateTypingStatus(chatId, currentUid, false);

    try {
      const ref = chatsRef(chatId);
      if (editingMessageId) {
        await ref.doc(editingMessageId).update({
          text: messageText,
          edited: true,
          editedTimestamp: serverTimestamp(),
        });
        setEditingMessageId(null);
      } else {
        const newMessage: any = {
          text: messageText,
          senderUid: currentUid,
          timestamp: serverTimestamp(),
          read: false,
          deletedGlobally: false,
          deletedFor: {},
          edited: false,
          reactions: {},
        };

        // Add reply information if replying to a message
        if (replyingTo) {
          newMessage.replyTo = {
            messageId: replyingTo.id,
            text: replyingTo.text,
            senderUid: replyingTo.senderUid,
            senderName:
              replyingTo.senderUid === currentUid ? 'You' : otherUser.name,
          };
          setReplyingTo(null);
        }

        await ref.add(newMessage);
        await incrementUnreadCount(chatId, currentUid, allParticipants);
      }
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const deleteForMe = async (messageId: string) => {
    try {
      const ref = chatsRef(chatId);
      await ref.doc(messageId).update({
        [`deletedFor.${currentUid}`]: true,
      });
      setMessages(prev => prev.filter((m: any) => m.id !== messageId));
    } catch (error) {
      console.error('Delete for me error:', error);
      Alert.alert('Error', 'Failed to delete message for you.');
    }
  };

  const deleteForEveryone = async (messageId: string) => {
    try {
      const ref = chatsRef(chatId);
      await ref.doc(messageId).update({
        deletedGlobally: true,
      });
      setMessages((prev: any) =>
        prev.map((m: any) =>
          m.id === messageId ? { ...m, deletedGlobally: true } : m,
        ),
      );
    } catch (error) {
      console.error('Delete for everyone error:', error);
      Alert.alert('Error', 'Failed to delete message for everyone.');
    }
  };

  const scrollToMessage = (messageId: string) => {
    const index = messages.findIndex((m: any) => m.id === messageId);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const typingText = isOtherTyping ? `${otherUser.name} is typing...` : null;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return (
      <Layout>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={'#fff'} />
        </View>
      </Layout>
    );
  }

  return (
    <MenuProvider>
      <Layout paddingTop={insests.top}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {selectedMessageForMenu ? (
            <View
              style={styles.selectionHeader}
              onLayout={event => {
                const { height } = event.nativeEvent.layout;
                const statusBarHeight =
                  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
                setHeaderHeight(height + statusBarHeight);
              }}
            >
              <TouchableOpacity
                onPress={closeMessageMenu}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.selectionHeaderText}>Message Selected</Text>
              <View style={styles.selectionActions}>
                <TouchableOpacity
                  onPress={() => handleReply(selectedMessageForMenu)}
                  style={styles.headerAction}
                >
                  <Icon name="arrow-undo-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (!showReactionPicker && selectedMessageForMenu) {
                      const ref =
                        messageRefs.current[selectedMessageForMenu.id];
                      if (ref) {
                        ref.measureInWindow((x, y, width, height) => {
                          setMessagePosition({ x, y, width, height });
                        });
                      }
                    }
                    setShowReactionPicker(prev => !prev);
                  }}
                  style={styles.headerAction}
                >
                  <Icon name="happy-outline" size={24} color="#fff" />
                </TouchableOpacity>
                {selectedMessageForMenu.senderUid === currentUid && (
                  <>
                    <TouchableOpacity
                      onPress={() => handleEdit(selectedMessageForMenu)}
                      style={styles.headerAction}
                    >
                      <Icon name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        handleDelete(
                          selectedMessageForMenu.id,
                          selectedMessageForMenu.senderUid,
                        )
                      }
                      style={styles.headerAction}
                    >
                      <Icon name="trash-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
            <ChatHeader
              chatId={chatId}
              currentUid={currentUid}
              setMessages={setMessages}
              name={otherUser.name}
              lastSeen={
                otherUser.isOnline ? '' : formatLastSeen(otherUser.lastSeen)
              }
              isOnline={otherUser.isOnline}
              onBack={() => navigation.goBack()}
              typing={isOtherTyping}
              isBlocked={isBlocked}
              otherUser={otherUser}
              profileImage={otherUser.profilePicture}
            />
          )}

          {/* FIX 1: marginBottom accounts for both the input bar height AND keyboard height,
              so the last message is always fully visible above the input */}
          <FlatList
            ref={flatListRef}
            showsVerticalScrollIndicator={false}
            data={messages}
            keyExtractor={(item: any) => item.id}
            renderItem={({ item, index }: any) => {
              const showDateSeparator =
                !!item.timestamp &&
                (index === 0 ||
                  isDifferentDay(
                    messages[index - 1].timestamp,
                    item.timestamp,
                  ));

              if (item.deletedGlobally) {
                return (
                  <>
                    {showDateSeparator && (
                      <View style={styles.dateSeparatorContainer}>
                        <View style={styles.dateSeparatorLine} />
                        <Text
                          style={[
                            styles.dateSeparatorText,
                            {
                              backgroundColor: colors.Colored_Text,
                              color: colors.Text_Primary_Color,
                            },
                          ]}
                        >
                          {getDateLabel(item.timestamp)}
                        </Text>
                        <View style={styles.dateSeparatorLine} />
                      </View>
                    )}
                    <View
                      style={{
                        alignSelf:
                          item.senderUid === currentUid
                            ? 'flex-end'
                            : 'flex-start',
                        marginVertical: 5,
                        paddingHorizontal: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#8d8888ff',
                        padding: 8,
                        borderRadius: 12,
                        gap: 5,
                      }}
                    >
                      <MessageDeleteIcon name="block" color={'white'} />
                      <Text
                        style={{
                          color: '#ffffffff',
                          fontStyle: 'italic',
                          fontSize: 14,
                        }}
                      >
                        This message was deleted
                      </Text>
                    </View>
                  </>
                );
              }
              return (
                <>
                  {showDateSeparator && (
                    <View style={styles.dateSeparatorContainer}>
                      <View style={styles.dateSeparatorLine} />
                      <Text
                        style={[
                          styles.dateSeparatorText,
                          {
                            backgroundColor: colors.Colored_Text,
                            color: colors.Text_Primary_Color,
                          },
                        ]}
                      >
                        {getDateLabel(item.timestamp)}
                      </Text>
                      <View style={styles.dateSeparatorLine} />
                    </View>
                  )}
                  <TouchableWithoutFeedback
                    onLongPress={() => handleLongPress(item)}
                  >
                    <View
                      ref={ref => {
                        if (ref) {
                          messageRefs.current[item.id] = ref;
                        } else {
                          delete messageRefs.current[item.id];
                        }
                      }}
                    >
                      <MessageBubble
                        text={item.text}
                        isMe={item.senderUid === currentUid}
                        timestamp={item.timestamp}
                        edited={item.edited}
                        reactions={item.reactions || {}}
                        isSelected={selectedMessageForMenu?.id === item.id}
                        currentUid={currentUid}
                        replyTo={item.replyTo}
                        onReplyPress={() =>
                          scrollToMessage(item.replyTo?.messageId)
                        }
                        selectedMessageForMenu={selectedMessageForMenu}
                        handleReply={handleReply}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </>
              );
            }}
            style={{
              flex: 1,
              paddingHorizontal: 10,
              // FIX: shrink the list so it never goes under the input bar or keyboard
              marginBottom: bottomHeight + keyboardHeight,
            }}
            contentContainerStyle={{ paddingBottom: 10 }}
          />

          {/* FIX 2: bottomContainer stays at bottom: 0 and moves up with the keyboard
              via the keyboardHeight offset. The FlatList margin above handles the rest. */}
          <View
            style={[
              styles.bottomContainer,
              {
                bottom: keyboardHeight,
              },
            ]}
            onLayout={event => setBottomHeight(event.nativeEvent.layout.height)}
            pointerEvents="box-none"
          >
            {!isBlocked && typingText ? (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>{typingText}</Text>
              </View>
            ) : null}

            {isBlocked || !canSend ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 20,
                  flexDirection: 'row',
                  gap: 2,
                }}
              >
                <CancelIcon name="block" size={14} color="red" />
                <Text
                  style={{ color: 'red', fontSize: 14, fontStyle: 'italic' }}
                >
                  {isBlocked
                    ? 'You have blocked this user'
                    : 'You are no longer friend with this user'}
                </Text>
              </View>
            ) : (
              <>
                {replyingTo && (
                  <View
                    style={[
                      styles.replyPreviewContainer,
                      { borderLeftColor: colors.Text_Primary_Color },
                    ]}
                  >
                    <View style={styles.replyPreviewContent}>
                      <View style={styles.replyPreviewHeader}>
                        <Icon
                          name="arrow-undo"
                          size={16}
                          color={colors.Colored_Text}
                        />
                        <Text
                          style={{
                            ...typography.Montserrat_Medium12,
                            color: colors.Colored_Text,
                          }}
                        >
                          Replying to{' '}
                          {replyingTo.senderUid === currentUid
                            ? 'yourself'
                            : otherUser.name}
                        </Text>
                      </View>
                      <Text style={styles.replyPreviewText} numberOfLines={1}>
                        {replyingTo.text}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={cancelReply}>
                      <Icon
                        name="close-circle"
                        size={24}
                        color={colors.Colored_Text}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.inputWrapper}>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: '#0b1220',
                        borderColor: colors.Border_Color,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    {editingMessageId && (
                      <TouchableOpacity
                        onPress={() => {
                          setEditingMessageId(null);
                          setText('');
                        }}
                        style={[styles.cancelButton]}
                      >
                        <CancelIcon
                          name="cancel"
                          size={32}
                          color={colors.Text_Primary_Color}
                        />
                      </TouchableOpacity>
                    )}
                    <TextInput
                      style={styles.textInput}
                      value={text}
                      onChangeText={handleInputChange}
                      placeholderTextColor={'#888383'}
                      placeholder={
                        editingMessageId
                          ? 'Edit message...'
                          : replyingTo
                          ? 'Reply...'
                          : 'Type a message...'
                      }
                    />

                    <TouchableOpacity
                      onPress={sendMessage}
                      style={[
                        styles.sendButton,
                        {
                          backgroundColor:
                            !text.trim() || !canSend
                              ? '#ddd'
                              : colors.Colored_Text,
                        },
                      ]}
                      disabled={!text.trim() || !canSend}
                    >
                      <Icon
                        name="send"
                        size={22}
                        color={text.trim() && canSend ? '#fff' : '#999'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          {showReactionPicker && selectedMessageForMenu && (
            <View style={styles.pickerContainer} pointerEvents="box-none">
              <TouchableWithoutFeedback
                onPress={() => {
                  setShowReactionPicker(false);
                  closeMessageMenu();
                }}
              >
                <View style={[styles.pickerOverlay, { top: headerHeight }]} />
              </TouchableWithoutFeedback>
              <View
                style={[
                  styles.reactionPicker,
                  {
                    position: 'absolute',
                    top: messagePosition.y + messagePosition.height,
                    left: messagePosition.x,
                  },
                ]}
              >
                {REACTIONS.map(emoji => {
                  const isSelected =
                    selectedMessageForMenu?.reactions?.[currentUid] === emoji;
                  return (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => handleReaction(emoji)}
                      style={[
                        styles.reactionButton,
                        isSelected && styles.reactionButtonSelected,
                      ]}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </Animated.View>

        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
          statusBarTranslucent={true}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <View
              style={{
                backgroundColor: '#cde4ee',
                padding: 20,
                borderRadius: 10,
                width: '80%',
              }}
            >
              <Text
                style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}
              >
                Delete Message
              </Text>
              <Text
                style={{
                  marginBottom: 22,
                  fontSize: 16,
                  fontStyle: 'italic',
                }}
              >
                Are you sure you want to delete this message?
              </Text>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 10,
                  marginBottom: 16,
                  borderRadius: 5,
                }}
                onPress={() => {
                  setShowDeleteModal(false);
                  deleteForMe(selectedMessageId);
                }}
              >
                <Text style={{ textAlign: 'right', fontSize: 16 }}>
                  Delete for me
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 10,
                  marginBottom: 16,
                  borderRadius: 5,
                }}
                onPress={async () => {
                  setShowDeleteModal(false);
                  await deleteForEveryone(selectedMessageId);
                }}
              >
                <Text
                  style={{ color: 'red', textAlign: 'right', fontSize: 16 }}
                >
                  Delete for everyone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={{ paddingHorizontal: 10 }}
              >
                <Text
                  style={{ color: 'blue', textAlign: 'right', fontSize: 16 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Layout>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 8,
    // backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#ddeaeb',
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 15,
    marginBottom: 10,
  },
  typingText: {
    fontStyle: 'italic',
    color: '#666',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
  },
  closeButton: {
    marginRight: 4,
  },
  selectionHeaderText: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerAction: {
    padding: 4,
  },
  reactionButton: {
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  reactionEmoji: {
    fontSize: 28,
  },
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  pickerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'space-around',
  },
  dateSeparatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3f3a8b48',
  },
  reactionButtonSelected: {
    backgroundColor: '#2661bb',
    borderRadius: 50,
  },
  dateSeparatorText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  replyPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 10,
    marginBottom: 5,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  replyPreviewContent: {
    flex: 1,
    marginRight: 10,
  },
  replyPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  replyPreviewText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignSelf: 'stretch',
    zIndex: 10,
    elevation: 5,
  },
});

export default ChatScreen;

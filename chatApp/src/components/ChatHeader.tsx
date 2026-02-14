// // import React from 'react';
// // import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
// // import Icon from 'react-native-vector-icons/Ionicons';
// // import DotIcon from 'react-native-vector-icons/Entypo';
// // import { colors } from '../utils/styles';

// // const ChatHeader = ({
// //   name,
// //   lastSeen,
// //   isOnline,
// //   typing,
// //   profileImage,
// //   onBack,
// // }: any) => {
// //   return (
// //     <View style={styles.container}>
// //       {/* Left Section */}
// //       <View style={styles.leftSection}>
// //         <TouchableOpacity onPress={onBack} style={styles.backButton}>
// //           <Icon name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>

// //         {/* Profile Image */}
// //         {profileImage ? (
// //           <Image source={{ uri: profileImage }} style={styles.avatar} />
// //         ) : (
// //           <View style={[styles.avatar, styles.defaultAvatar]}>
// //             <Icon name="person-outline" size={22} color="#fff" />
// //           </View>
// //         )}

// //         {/* Name + Status */}
// //         <View>
// //           <View style={styles.nameRow}>
// //             <Text numberOfLines={1} style={styles.nameText}>
// //               {name || 'Chat'}
// //             </Text>
// //             {isOnline && <View style={styles.onlineDot} />}
// //           </View>

// //           <Text style={styles.statusText}>
// //             {typing
// //               ? 'Typing...'
// //               : isOnline
// //               ? 'Online'
// //               : lastSeen
// //               ? `Last seen ${lastSeen}`
// //               : ''}
// //           </Text>
// //         </View>
// //       </View>

// //       {/* Right Icons */}
// //       <View style={styles.rightIcons}>
// //         <TouchableOpacity style={styles.iconButton}>
// //           <DotIcon name="dots-three-vertical" size={22} color="#fff" />
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     backgroundColor: colors.primary,
// //     paddingHorizontal: 10,
// //     paddingVertical: 8,
// //     paddingBottom: 12,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',

// //     borderBottomLeftRadius: 28,
// //     borderBottomRightRadius: 28,
// //   },
// //   leftSection: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flex: 1,
// //   },
// //   backButton: {
// //     marginRight: 8,
// //     padding: 4,
// //   },
// //   avatar: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     marginRight: 10,
// //     backgroundColor: '#ccc',
// //   },
// //   defaultAvatar: {
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   nameRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   nameText: {
// //     fontSize: 16,
// //     fontWeight: '600',
// //     color: '#fff',
// //     maxWidth: 150,
// //   },
// //   onlineDot: {
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     backgroundColor: '#34C759',
// //     marginLeft: 6,
// //   },
// //   statusText: {
// //     fontSize: 12,
// //     color: '#E8E8E8',
// //   },
// //   rightIcons: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   iconButton: {
// //     marginHorizontal: 6,
// //     padding: 4,
// //   },
// // });

// // export default ChatHeader;

// import React from 'react';
// import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LeaveIcon from 'react-native-vector-icons/FontAwesome5';
// import DotIcon from 'react-native-vector-icons/Entypo';
// import { colors } from '../utils/styles';

// const ChatHeader = ({
//   name,
//   lastSeen,
//   isOnline,
//   typing,
//   profileImage,
//   onBack,
//   onOptionsPress,
//   isGroup,
// }: any) => {
//   return (
//     <View style={styles.container}>
//       {/* Left Section */}
//       <View style={styles.leftSection}>
//         <TouchableOpacity onPress={onBack} style={styles.backButton}>
//           <Icon name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>

//         {/* Profile Image */}
//         {profileImage ? (
//           <Image source={{ uri: profileImage }} style={styles.avatar} />
//         ) : (
//           <View style={[styles.avatar, styles.defaultAvatar]}>
//             <Icon name="person-outline" size={22} color="#fff" />
//           </View>
//         )}

//         {/* Name + Status */}
//         <View>
//           <View style={styles.nameRow}>
//             <Text numberOfLines={1} style={styles.nameText}>
//               {name || 'Chat'}
//             </Text>
//             {isOnline && !isGroup && <View style={styles.onlineDot} />}
//           </View>

//           {isGroup ? (
//             <Text style={styles.statusText}>
//               {typing ? 'Typing...' : 'Group Chat'}
//             </Text>
//           ) : (
//             <Text style={styles.statusText}>
//               {typing
//                 ? 'Typing...'
//                 : isOnline
//                 ? 'Online'
//                 : lastSeen
//                 ? `Last seen ${lastSeen}`
//                 : ''}
//             </Text>
//           )}
//         </View>
//       </View>

//       {/* Right Icons */}
//       <View style={styles.rightIcons}>
//         {onOptionsPress && (
//           <TouchableOpacity style={styles.iconButton} onPress={onOptionsPress}>
//             {isGroup ? (
//               <LeaveIcon name="running" size={22} color="#fff" />
//             ) : (
//               <DotIcon name="dots-three-vertical" size={22} color="#fff" />
//             )}
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: colors.primary,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     paddingBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',

//     borderBottomLeftRadius: 28,
//     borderBottomRightRadius: 28,
//   },
//   leftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   backButton: {
//     marginRight: 8,
//     padding: 4,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//     backgroundColor: '#ccc',
//   },
//   defaultAvatar: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   nameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   nameText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#fff',
//     maxWidth: 150,
//   },
//   onlineDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#34C759',
//     marginLeft: 6,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#E8E8E8',
//   },
//   rightIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     marginHorizontal: 6,
//     padding: 4,
//   },
// });

// export default ChatHeader;

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LeaveIcon from 'react-native-vector-icons/FontAwesome5';
import DotIcon from 'react-native-vector-icons/Entypo';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { colors } from '../utils/styles';
import {
  blockUser,
  clearChatForUser,
  leaveGroup,
  unblockUser,
} from '../services/firebase';
import { showError, showSuccess } from '../utils/ToastMessage';
import { useNavigation } from '@react-navigation/native';

const ChatHeader = ({
  chatId,
  setMessages,
  currentUid,
  name,
  lastSeen,
  isOnline,
  typing,
  profileImage,
  onBack,
  group,
  onHeaderLayout,
  isBlocked,
  otherUser,
}: any) => {
  const [showModal, setShowModal] = React.useState(false);
  const [modalType, setModalType] = React.useState('clearChat');
  const isGroup = !!group;
  const navigation: any = useNavigation();
  const [loading, setLoading] = React.useState(false);

  const handleClearChat = async () => {
    setLoading(true);
    try {
      await clearChatForUser(chatId, currentUid, isGroup);
      setMessages([]);
      showSuccess('Chat cleared successfully');
    } catch (error) {
      console.log(error, 'Error in chat clear');
      showError('Failed to clear chat');
    } finally {
      setShowModal(false);
      setLoading(false);
    }
  };

  const handleLeave = async (groupId: string) => {
    setLoading(true);
    try {
      await leaveGroup(groupId, currentUid);
      await DeviceEventEmitter.emit('refreshConversations');
      showSuccess('Left group successfully');
      navigation.goBack();
    } catch (error: any) {
      console.log(error, 'Error in leave group');
      showError('Failed to leave group');
    } finally {
      setShowModal(false);
      setLoading(false);
    }
  };

  const handleBlockToggle = useCallback(async () => {
    try {
      if (isBlocked) {
        await unblockUser(currentUid, otherUser.uid);
        showSuccess('User unblocked successfully');
      } else {
        await blockUser(currentUid, otherUser.uid);
        showSuccess('User blocked successfully');
      }
    } catch (error) {
      console.log(error, 'Error in block toggle');
      showError('Failed to update block status');
    }
  }, [isBlocked, currentUid, otherUser?.uid]);

  return (
    <View style={styles.container}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Profile Image */}
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Icon name="person-outline" size={22} color="#fff" />
          </View>
        )}

        {/* Name + Status */}
        <View>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.nameText}>
              {name || 'Chat'}
            </Text>
            {isOnline && !isGroup && <View style={styles.onlineDot} />}
          </View>

          {isGroup ? (
            <Text style={styles.statusText}>
              {typing ? 'Typing...' : 'Group Chat'}
            </Text>
          ) : (
            <Text style={styles.statusText}>
              {typing
                ? 'Typing...'
                : isOnline
                ? 'Online'
                : lastSeen
                ? `Last seen ${lastSeen}`
                : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Right Icons */}
      <View style={styles.rightIcons}>
        <Menu>
          <MenuTrigger
            customStyles={
              {
                // triggerWrapperStyle: { marginHorizontal: 6, padding: 4 },
                // triggerWrapper: {
                //   backgroundColor: 'lightgreen',
                // },
              }
            }
          >
            <DotIcon name="dots-three-vertical" size={22} color="#fff" />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: {
                marginTop: 20,
                borderRadius: 12,
                marginLeft: -10,
              },
            }}
          >
            <MenuOption
              style={{ marginVertical: 2 }}
              onSelect={() => {
                setModalType('clearChat');
                setShowModal(true);
              }}
            >
              <Text style={styles.menuText}>Clear Chat</Text>
            </MenuOption>
            {!isGroup ? (
              <MenuOption onSelect={handleBlockToggle}>
                <Text
                  style={[
                    styles.menuText,
                    { color: isBlocked ? '#333' : 'red' },
                  ]}
                >
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </Text>
              </MenuOption>
            ) : (
              <MenuOption
                onSelect={() => {
                  setModalType('leaveGroup');
                  setShowModal(true);
                }}
              >
                <Text style={[styles.menuText, { color: 'red' }]}>
                  Leave Group
                </Text>
              </MenuOption>
            )}
          </MenuOptions>
        </Menu>
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
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
              backgroundColor: colors.background,
              padding: 20,
              borderRadius: 10,
              width: '80%',
            }}
          >
            <Text
              style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}
            >
              {modalType === 'leaveGroup' ? 'Leave Group' : 'Clear Chat'}
            </Text>
            <Text
              style={{
                marginBottom: 22,
                fontSize: 16,
                fontStyle: 'italic',
              }}
            >
              {modalType === 'leaveGroup'
                ? 'Are you sure you want to leave this group?'
                : 'Are you sure you want to clear this chat?'}
            </Text>

            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                marginBottom: 16,
                borderRadius: 5,
              }}
              onPress={
                modalType === 'leaveGroup'
                  ? () => handleLeave(group.id)
                  : handleClearChat
              }
            >
              <Text style={{ color: 'red', textAlign: 'right', fontSize: 16 }}>
                {loading
                  ? 'Loading...'
                  : modalType === 'leaveGroup'
                  ? 'Leave'
                  : 'Clear'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading}
              onPress={() => setShowModal(false)}
              style={{ paddingHorizontal: 10 }}
            >
              <Text style={{ color: 'blue', textAlign: 'right', fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    maxWidth: 150,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginLeft: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#E8E8E8',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});

export default ChatHeader;

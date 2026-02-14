// // import React from 'react';
// // import { View, Text, StyleSheet } from 'react-native';
// // import { globalStyles, colors } from '../utils/styles';

// // const MessageBubble = ({
// //   text,
// //   isMe,
// //   timestamp,
// //   senderName,
// //   edited = false,
// // }: any) => {
// //   const timeText =
// //     timestamp
// //       ?.toDate?.()
// //       ?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

// //   return (
// //     <>
// //       <View
// //         style={[
// //           styles.bubble,
// //           isMe
// //             ? { alignSelf: 'flex-end', backgroundColor: '#6968a3ff' }
// //             : { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
// //         ]}
// //       >
// //         {!isMe && senderName && (
// //           <Text style={styles.senderName}>{senderName}</Text>
// //         )}
// //         <Text
// //           style={{
// //             color: isMe ? '#fff' : colors.text,
// //             fontSize: 16,
// //             lineHeight: 20,
// //           }}
// //         >
// //           {text}
// //         </Text>
// //         <View style={styles.timestampContainer}>
// //           <Text
// //             style={[
// //               styles.timestamp,
// //               { color: isMe ? '#fff' : colors.textSecondary },
// //             ]}
// //           >
// //             {timeText}
// //           </Text>
// //           {edited && (
// //             <Text
// //               style={[
// //                 styles.editedIndicator,
// //                 { color: isMe ? '#43b94dff' : '#0ba073ff' },
// //               ]}
// //             >
// //               • edited
// //             </Text>
// //           )}
// //         </View>
// //       </View>
// //     </>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   bubble: {
// //     padding: 12,
// //     marginVertical: 4,
// //     borderRadius: 18,
// //     maxWidth: '75%',
// //     shadowColor: '#000',
// //     shadowOpacity: 0.1,
// //     shadowRadius: 2,
// //     elevation: 2,
// //   },
// //   senderName: {
// //     fontSize: 12,
// //     fontWeight: 'bold',
// //     color: colors.textSecondary,
// //     marginBottom: 4,
// //   },
// //   timestampContainer: {
// //     flexDirection: 'row',
// //     alignSelf: 'flex-end',
// //     alignItems: 'center',
// //     marginTop: 4,
// //   },
// //   timestamp: {
// //     fontSize: 10,
// //   },
// //   editedIndicator: {
// //     fontSize: 11,
// //     fontStyle: 'italic',
// //     marginLeft: 4,
// //     opacity: 0.8,
// //   },
// // });

// // export default MessageBubble;

// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { globalStyles, colors } from '../utils/styles';

// const MessageBubble = ({
//   text,
//   isMe,
//   timestamp,
//   senderName,
//   edited = false,
//   reactions = {},
//   isSelected = false,
//   senderNames = {},
//   currentUid,
// }: any) => {
//   const timeText =
//     timestamp
//       ?.toDate?.()
//       ?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

//   // Group reactions by emoji
//   const groupedReactions: { [emoji: string]: string[] } = {};
//   Object.entries(reactions).forEach(([uid, emoji]: [string, any]) => {
//     if (emoji) {
//       if (!groupedReactions[emoji]) {
//         groupedReactions[emoji] = [];
//       }
//       groupedReactions[emoji].push(uid);
//     }
//   });

//   const hasReactions = Object.keys(groupedReactions).length > 0;

//   return (
//     <View
//       style={{
//         marginVertical: 4,
//         backgroundColor: isSelected ? '#60df5427' : 'transparent',
//         borderRadius: isSelected ? 18 : 0,
//         padding: isSelected ? 4 : 0,
//       }}
//     >
//       <View
//         style={[
//           styles.bubble,
//           isMe
//             ? { alignSelf: 'flex-end', backgroundColor: '#6968a3ff' }
//             : { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
//           // isSelected && styles.selectedBubble,
//         ]}
//       >
//         {!isMe && senderName && (
//           <Text style={styles.senderName}>{senderName}</Text>
//         )}
//         <Text
//           style={{
//             color: isMe ? '#fff' : colors.text,
//             fontSize: 16,
//             lineHeight: 20,
//           }}
//         >
//           {text}
//         </Text>
//         <View style={styles.timestampContainer}>
//           <Text
//             style={[
//               styles.timestamp,
//               { color: isMe ? '#fff' : colors.textSecondary },
//             ]}
//           >
//             {timeText}
//           </Text>
//           {edited && (
//             <Text
//               style={[
//                 styles.editedIndicator,
//                 { color: isMe ? '#43b94dff' : '#0ba073ff' },
//               ]}
//             >
//               • edited
//             </Text>
//           )}
//         </View>
//       </View>

//       {hasReactions && (
//         <View
//           style={[
//             styles.reactionsContainer,
//             isMe ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
//           ]}
//         >
//           {Object.entries(groupedReactions).map(
//             ([emoji, uids]: [string, string[]]) => (
//               <View key={emoji} style={styles.reactionPill}>
//                 <Text style={styles.reactionEmoji}>{emoji}</Text>
//                 {uids.length > 1 && (
//                   <Text style={styles.reactionCount}>{uids.length}</Text>
//                 )}
//                 {/* {uids.includes(currentUid) && (
//                   <View style={styles.reactionIndicator} />
//                 )} */}
//               </View>
//             ),
//           )}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   bubble: {
//     padding: 12,
//     borderRadius: 18,
//     maxWidth: '75%',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   selectedBubble: {
//     backgroundColor: '#d0d0d0 !important',
//     opacity: 0.8,
//   },
//   senderName: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: colors.textSecondary,
//     marginBottom: 4,
//   },
//   timestampContainer: {
//     flexDirection: 'row',
//     alignSelf: 'flex-end',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   timestamp: {
//     fontSize: 10,
//   },
//   editedIndicator: {
//     fontSize: 11,
//     fontStyle: 'italic',
//     marginLeft: 4,
//     opacity: 0.8,
//   },
//   reactionsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: -8,
//     marginHorizontal: 8,
//     gap: 4,
//   },
//   reactionPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//     gap: 3,
//   },
//   reactionEmoji: {
//     fontSize: 14,
//   },
//   reactionCount: {
//     fontSize: 11,
//     color: '#666',
//     fontWeight: '600',
//   },
//   reactionIndicator: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: colors.primary,
//   },
// });

// export default MessageBubble;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { globalStyles, colors } from '../utils/styles';

const MessageBubble = ({
  text,
  isMe,
  timestamp,
  senderName,
  edited = false,
  reactions = {},
  isSelected = false,
  senderNames = {},
  currentUid,
  replyTo,
  onReplyPress,
  selectedMessageForMenu,
  handleReply,
}: any) => {
  const timeText =
    timestamp
      ?.toDate?.()
      ?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

  // Group reactions by emoji
  const groupedReactions: { [emoji: string]: string[] } = {};
  Object.entries(reactions).forEach(([uid, emoji]: [string, any]) => {
    if (emoji) {
      if (!groupedReactions[emoji]) {
        groupedReactions[emoji] = [];
      }
      groupedReactions[emoji].push(uid);
    }
  });

  const hasReactions = Object.keys(groupedReactions).length > 0;

  return (
    <View
      style={{
        marginVertical: 4,
        marginBottom: hasReactions ? 8 : 0,
        backgroundColor: isSelected ? '#60df5427' : 'tansparent',
        borderRadius: isSelected ? 18 : 0,
        padding: isSelected ? 4 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        gap: 20,
      }}
    >
      <View
        style={{
          // backgroundColor: 'green',
          maxWidth: '75%',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
          borderRadius: 18,
        }}
      >
        <View
          style={{
            backgroundColor: isMe ? '#6968a3ff' : '#d1d1dab2',
            padding: 12,
            borderRadius: 18,
          }}
        >
          {!isMe && senderName && (
            <Text style={styles.senderName}>{senderName}</Text>
          )}
          {/* Reply Preview */}
          {replyTo && (
            <TouchableOpacity
              onPress={onReplyPress}
              style={[
                isMe ? styles.replyContainerMe : styles.replyContainerOther,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 5,
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  { height: '100%', width: 2, borderRadius: 18 },
                  isMe ? styles.replyBorderMe : styles.replyBorderOther,
                ]}
              />
              <View>
                <View style={styles.replyHeader}>
                  <Icon
                    name="arrow-undo"
                    size={12}
                    color={isMe ? '#fff' : colors.primary}
                  />
                  <Text
                    style={[
                      styles.replySenderName,
                      { color: isMe ? '#e0e0e0' : colors.primary },
                    ]}
                  >
                    {replyTo.senderName}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.replyText,
                    { color: isMe ? '#e8e8e8' : '#555' },
                  ]}
                  numberOfLines={1}
                >
                  {replyTo.text}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <Text
            style={{
              color: isMe ? '#fff' : colors.text,
              fontSize: 16,
              lineHeight: 20,
            }}
          >
            {text}
          </Text>
          <View style={styles.timestampContainer}>
            <Text
              style={[
                styles.timestamp,
                { color: isMe ? '#fff' : colors.textSecondary },
              ]}
            >
              {timeText}
            </Text>
            {edited && (
              <Text
                style={[
                  styles.editedIndicator,
                  { color: isMe ? '#43b94dff' : '#0ba073ff' },
                ]}
              >
                • edited
              </Text>
            )}
          </View>
          {hasReactions && (
            <View
              style={[
                styles.reactionsContainer,
                // isMe ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' },
              ]}
            >
              {Object.entries(groupedReactions).map(
                ([emoji, uids]: [string, string[]]) => (
                  <View key={emoji} style={styles.reactionPill}>
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                    {uids.length > 1 && (
                      <Text style={styles.reactionCount}>{uids.length}</Text>
                    )}
                  </View>
                ),
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  editedIndicator: {
    fontSize: 11,
    fontStyle: 'italic',
    marginLeft: 4,
    opacity: 0.8,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: -22,
    marginHorizontal: 8,
    // gap: 4,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 3,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  reactionIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  replyContainer: {
    marginBottom: 8,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
  },
  replyContainerMe: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  replyContainerOther: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  replyBorder: {
    width: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  replyBorderMe: {
    backgroundColor: '#fff',
  },
  replyBorderOther: {
    backgroundColor: colors.primary,
  },
  replyContent: {
    // flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 4,
  },
  replySenderName: {
    fontSize: 11,
    fontWeight: '700',
  },
  replyText: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.9,
  },
});

export default MessageBubble;

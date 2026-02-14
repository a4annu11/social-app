import auth, { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database'; // For connection ref (Realtime DB for .info/connected; hybrid with Firestore ok, free)

// Auth
export const onAuthStateChanged = callback =>
  auth().onAuthStateChanged(callback);
export const createUserWithEmailAndPassword = (email, password) =>
  auth().createUserWithEmailAndPassword(email, password);
export const signInWithEmailAndPassword = (email, password) =>
  auth().signInWithEmailAndPassword(email, password);
export const signOut = () => auth().signOut();
export const currentUser = () => auth().currentUser;

// Firestore
export const usersRef = () => firestore().collection('users');
export const chatsRef = chatId =>
  firestore().collection('chats').doc(chatId).collection('messages');
export const serverTimestamp = () => firestore.FieldValue.serverTimestamp();
export const chatDocRef = chatId => firestore().collection('chats').doc(chatId);
// export const serverTimestamp = () => firestore.FieldValue.serverTimestamp();

// Setup online/offline listener (call once in App.js)
export const setupConnectionListener = uid => {
  const connectedRef = database().ref('.info/connected');
  const userStatusRef = database().ref(`/status/${uid}`);

  connectedRef.on('value', snap => {
    if (snap.val() === true) {
      userStatusRef.set(true).then(() => {
        // Update Firestore isOnline
        usersRef().doc(uid).update({ isOnline: true });
      });
    } else {
      // Offline: Set lastSeen
      usersRef().doc(uid).update({
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    }
  });

  // Cleanup on unmount
  return () => connectedRef.off();
};

// For typing: Update chat doc
// For typing: Update chat doc
export const updateTypingStatus = async (
  chatId,
  uid,
  isTyping,
  isGroup = false,
) => {
  try {
    const docRef = isGroup
      ? firestore().collection('groups').doc(chatId)
      : firestore().collection('chats').doc(chatId);

    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      console.warn('Document does not exist:', chatId);
      return;
    }

    if (isTyping) {
      await docRef.update({
        typingBy: firestore.FieldValue.arrayUnion(uid),
      });
    } else {
      await docRef.update({
        typingBy: firestore.FieldValue.arrayRemove(uid),
      });
    }
  } catch (error) {
    console.error('Update typing status error:', error);
  }
};

// groups

export const groupsRef = () => firestore().collection('groups');
export const groupMessagesRef = groupId =>
  firestore().collection('groups').doc(groupId).collection('messages');
export const joinGroup = (groupId, uid) =>
  groupsRef()
    .doc(groupId)
    .update({
      members: firestore.FieldValue.arrayUnion(uid),
    });
export const leaveGroup = (groupId, uid) =>
  groupsRef()
    .doc(groupId)
    .update({
      members: firestore.FieldValue.arrayRemove(uid),
    });

export const createGroup = async (
  name,
  description = '',
  adminUid,
  category = '',
) => {
  const groupId = groupsRef().doc().id; // Auto-generate ID
  await groupsRef()
    .doc(groupId)
    .set({
      name,
      description,
      category,
      members: [adminUid],
      admin: adminUid,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  return groupId;
};

// messagesScreen

export const fetchUserChats = uid => {
  // 1:1 chats
  return firestore()
    .collection('chats')
    .where('participants', 'array-contains', uid)
    .get()
    .then(snapshot =>
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'chat' })),
    );
};

export const fetchUserGroups = uid => {
  return groupsRef()
    .where('members', 'array-contains', uid)
    .get()
    .then(snapshot =>
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'group' })),
    );
};

export const getLastMessage = (chatId, isGroup = false) => {
  const ref = isGroup ? groupMessagesRef(chatId) : chatsRef(chatId);
  return ref
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()
    .then(snapshot => snapshot.docs[0]?.data());
};

export const getUnreadCount = (chatId, uid, isGroup = false) => {
  const ref = isGroup ? groupMessagesRef(chatId) : chatsRef(chatId);
  return ref
    .where('read', '==', false)
    .where('senderUid', '!=', uid)
    .get()
    .then(snapshot => snapshot.size);
};

// Mark as read (call on open chat)
// export const markAsRead = (chatId, uid, isGroup = false) => {
//   const ref = isGroup ? groupMessagesRef(chatId) : chatsRef(chatId);
//   return ref
//     .where('read', '==', false)
//     .where('senderUid', '!=', uid)
//     .get()
//     .then(snapshot => {
//       const batch = firestore().batch();
//       snapshot.docs.forEach(doc => {
//         batch.update(doc.ref, { read: true });
//       });
//       return batch.commit();
//     });
// };

// Increment unread count for all participants except sender
// Increment unread count for all participants except sender
export const incrementUnreadCount = async (
  chatId,
  senderUid,
  isGroup,
  participants = [],
) => {
  try {
    // Use the correct collection based on type
    const chatDoc = isGroup
      ? firestore().collection('groups').doc(chatId)
      : firestore().collection('chats').doc(chatId);

    const snapshot = await chatDoc.get();

    if (!snapshot.exists) {
      console.warn('Document does not exist:', chatId);
      return;
    }

    const data = snapshot.data();
    const currentUnread = data?.unreadCount || {};

    // Increment for all participants except sender
    const updates = {};
    participants.forEach(uid => {
      if (uid !== senderUid) {
        updates[`unreadCount.${uid}`] =
          firebase.firestore.FieldValue.increment(1);
      }
    });

    await chatDoc.update(updates);
    console.log('Unread count incremented for', chatId);
  } catch (error) {
    console.error('Increment unread error:', error);
  }
};

// Mark all messages as read for current user
// Mark all messages as read for current user
export const markAsRead = async (chatId, userId, isGroup = false) => {
  try {
    // Use the correct collection based on type
    const chatDoc = isGroup
      ? firestore().collection('groups').doc(chatId)
      : firestore().collection('chats').doc(chatId);

    // Reset unread count to 0
    await chatDoc.update({
      [`unreadCount.${userId}`]: 0,
    });

    // Also mark individual messages as read (optional, for double-check icon)
    const messagesRef = isGroup ? groupMessagesRef(chatId) : chatsRef(chatId);
    const unreadMessages = await messagesRef
      .where('read', '==', false)
      .where('senderUid', '!=', userId)
      .get();

    const batch = firebase.firestore().batch();
    unreadMessages.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    if (!unreadMessages.empty) {
      await batch.commit();
    }

    console.log('Marked as read for', chatId);
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

// Get unread count from chat document (faster than counting messages)
export const getUnreadCountFast = async (chatId, userId) => {
  try {
    const chatDoc = await chatDocRef(chatId).get();
    if (chatDoc.exists) {
      const data = chatDoc.data();
      const unreadMap = data?.unreadCount || {};
      return unreadMap[userId] || 0;
    }
    return 0;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
};

// Initialize chat document with participants
// Initialize chat document with participants
// Initialize chat document with participants
// Initialize chat document with participants
export const initializeChatDoc = async (chatId, participants, isGroup) => {
  try {
    const chatDoc = chatDocRef(chatId);
    const snapshot = await chatDoc.get();

    if (!snapshot.exists) {
      console.log('Creating new chat document:', chatId);
      console.log('Participants:', participants);
      console.log('Is group:', isGroup);

      // Initialize with 0 unread for all participants
      const unreadCount = {};
      participants.forEach(uid => {
        unreadCount[uid] = 0;
      });

      const dataToSave = {
        participants: participants, // Always set participants for 1:1 chats
        ...(isGroup ? { members: participants } : {}),
        createdAt: firestore.FieldValue.serverTimestamp(), // Use FieldValue, not the function
        typingBy: [],
        unreadCount,
      };

      console.log('💾 Data to save:', JSON.stringify(dataToSave, null, 2));

      await chatDoc.set(dataToSave);

      console.log('✅ Chat document created successfully:', chatId);

      // Verify it was saved
      const verifySnapshot = await chatDoc.get();
      console.log('✅ Verification - Document exists:', verifySnapshot.exists);
      if (verifySnapshot.exists) {
        const data = verifySnapshot.data();
        console.log(
          '✅ Verification - Has participants:',
          !!data?.participants,
        );
        console.log('✅ Verification - Participants:', data?.participants);
      }
    } else {
      const existingData = snapshot.data();
      console.log('Chat document already exists:', chatId);

      // Check if document has data
      if (!existingData || !existingData.participants) {
        console.log('⚠️ Document exists but missing data. Re-initializing...');

        // Fix the broken document
        const unreadCount = {};
        participants.forEach(uid => {
          unreadCount[uid] = 0;
        });

        await chatDoc.set(
          {
            participants: participants,
            ...(isGroup ? { members: participants } : {}),
            createdAt: firestore.FieldValue.serverTimestamp(),
            typingBy: [],
            unreadCount,
          },
          { merge: true },
        ); // Use merge to not overwrite if there's partial data

        console.log('✅ Document re-initialized with data');
      } else {
        console.log('📄 Existing data:', JSON.stringify(existingData, null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Initialize chat doc error:', error);
    throw error;
  }
};

// User activity summary
export const getUserActivityStats = async uid => {
  try {
    const [userChats, userGroups] = await Promise.all([
      fetchUserChats(uid),
      fetchUserGroups(uid),
    ]);

    let sent = 0;
    let received = 0;

    // Count messages in all chats (lightweight, summary-style)
    for (const chat of userChats) {
      const messagesSnap = await chatsRef(chat.id).get();
      messagesSnap.docs.forEach(doc => {
        const msg = doc.data();
        if (msg.senderUid === uid) sent++;
        else received++;
      });
    }

    return {
      messagesSent: sent,
      messagesReceived: received,
      groupsJoined: userGroups.length,
    };
  } catch (error) {
    console.error('Error fetching user activity stats:', error);
    return { messagesSent: 0, messagesReceived: 0, groupsJoined: 0 };
  }
};

// ✅ Suggested Friends (exclude current user + already chatted users)
export const fetchSuggestedFriends = async uid => {
  try {
    const [allUsersSnap, userChats] = await Promise.all([
      usersRef().get(),
      fetchUserChats(uid),
    ]);

    const chattedUserIds = userChats.map(chat =>
      chat.participants.find(id => id !== uid),
    );

    const allUsers = allUsersSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.id !== uid && !chattedUserIds.includes(user.id));

    // Shuffle + limit to 5
    return allUsers.sort(() => 0.5 - Math.random()).slice(0, 5);
  } catch (err) {
    console.error('Error fetching suggested friends:', err);
    return [];
  }
};

// ✅ Chat Streaks (based on last active days)
export const getChatStreak = async uid => {
  try {
    const chats = await fetchUserChats(uid);
    const today = new Date();
    const activeDays = new Set();

    for (const chat of chats) {
      const messagesSnap = await chatsRef(chat.id)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      messagesSnap.docs.forEach(doc => {
        const msg = doc.data();
        if (msg.senderUid === uid && msg.createdAt?.toDate) {
          const d = msg.createdAt.toDate();
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          activeDays.add(key);
        }
      });
    }

    // Calculate streak: consecutive days including today
    let streak = 0;
    let checkDate = new Date();

    while (true) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (activeDays.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    return streak;
  } catch (err) {
    console.error('Error fetching chat streak:', err);
    return 0;
  }
};

// Delete a group — only allowed for admin/creator
export const deleteGroup = async (groupId, currentUid) => {
  const groupDoc = groupsRef().doc(groupId);
  const snapshot = await groupDoc.get();

  if (!snapshot.exists) {
    throw new Error('Group not found');
  }

  const groupData = snapshot.data();
  // if (groupData.createdBy !== currentUid) {
  //   throw new Error('You are not authorized to delete this group');
  // }

  // Delete all group messages before deleting group doc
  const messagesSnapshot = await groupMessagesRef(groupId).get();
  const batch = firestore().batch();

  messagesSnapshot.forEach(doc => batch.delete(doc.ref));
  batch.delete(groupDoc);

  await batch.commit();
  console.log(`Group ${groupData.name} deleted successfully`);
};

// Generate consistent chat ID for 1:1 chats
export const getChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

// Block/Unblock functions
export const blockUser = async (blockerUid, blockedUid) => {
  try {
    await usersRef()
      .doc(blockerUid)
      .update({
        blockedUsers: firestore.FieldValue.arrayUnion(blockedUid),
      });
  } catch (error) {
    console.error('Block user error:', error);
    throw error;
  }
};

export const unblockUser = async (blockerUid, blockedUid) => {
  try {
    await usersRef()
      .doc(blockerUid)
      .update({
        blockedUsers: firestore.FieldValue.arrayRemove(blockedUid),
      });
  } catch (error) {
    console.error('Unblock user error:', error);
    throw error;
  }
};

// Add this function to your existing firebase.js file

// Clear chat for a specific user (marks all messages as deleted for that user)
export const clearChatForUser = async (chatId, userId, isGroup = false) => {
  try {
    const messagesRef = isGroup ? groupMessagesRef(chatId) : chatsRef(chatId);

    // Get all messages in the chat
    const snapshot = await messagesRef.get();

    if (snapshot.empty) {
      console.log('No messages to clear');
      return;
    }

    // Use batch to update multiple messages at once (more efficient)
    const batch = firestore().batch();

    snapshot.docs.forEach(doc => {
      const messageRef = messagesRef.doc(doc.id);
      batch.update(messageRef, {
        [`deletedFor.${userId}`]: true,
      });
    });

    // Commit all updates at once
    await batch.commit();

    console.log(`Chat cleared for user ${userId} in chat ${chatId}`);
  } catch (error) {
    console.error('Clear chat error:', error);
    throw error;
  }
};

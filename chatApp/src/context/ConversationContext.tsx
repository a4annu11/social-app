import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  fetchUserChats,
  fetchUserGroups,
  getLastMessage,
  getUnreadCount,
  currentUser,
} from '../services/firebase';
import { usersRef } from '../services/firebase';
import { formatLastSeen } from '../utils/time';

interface Conversation {
  id: string;
  type: 'chat' | 'group';
  title: string;
  preview: string;
  timestamp: any;
  unreadCount: number;
  participants?: string[];
  members?: string[];
}

interface ConversationContextType {
  conversations: Conversation[];
  updateConversation: (convId: string, updates: Partial<Conversation>) => void;
  refreshConversations: () => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined,
);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const updateConversation = useCallback(
    (convId: string, updates: Partial<Conversation>) => {
      setConversations(prev =>
        prev.map(conv => (conv.id === convId ? { ...conv, ...updates } : conv)),
      );
    },
    [],
  );

  const refreshConversations = useCallback(async () => {
    const uid = currentUser()?.uid;
    if (!uid) return;
    try {
      const [chats, groups] = await Promise.all([
        fetchUserChats(uid),
        fetchUserGroups(uid),
      ]);

      const allConv = [...chats, ...groups];

      const enrichedPromises = allConv.map(async conv => {
        let lastMsg = null;
        let unread = 0;
        let title = conv.name || 'Unknown';

        try {
          lastMsg = await getLastMessage(conv.id, conv.type === 'group');
          unread = await getUnreadCount(conv.id, uid, conv.type === 'group');

          if (conv.type === 'chat') {
            const otherUid = conv.participants.find((p: string) => p !== uid);
            if (otherUid) {
              const otherDoc = await usersRef().doc(otherUid).get();
              const otherUser = otherDoc.exists ? otherDoc.data() : null;
              title = otherUser?.name || 'Unknown User';
            }
          } else {
            title = conv.name || 'Unknown Group';
          }
        } catch (error) {
          console.error(`Enrich error for ${conv.type} ${conv.id}:`, error);
        }

        return {
          ...conv,
          title,
          preview: lastMsg?.text
            ? `${lastMsg.text.substring(0, 30)}${
                lastMsg.text.length > 30 ? '...' : ''
              }`
            : 'No messages yet',
          timestamp: lastMsg?.timestamp || null,
          unreadCount: unread,
        };
      });

      const enriched = await Promise.all(enrichedPromises);

      enriched.sort((a, b) => {
        const aTime = a.timestamp ? a.timestamp.toMillis() : -Infinity;
        const bTime = b.timestamp ? b.timestamp.toMillis() : -Infinity;
        return bTime - aTime;
      });

      setConversations(enriched);
    } catch (error) {
      console.error('Refresh convs error:', error);
    }
  }, []);

  return (
    <ConversationContext.Provider
      value={{ conversations, updateConversation, refreshConversations }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversations = () => {
  const context = useContext(ConversationContext);
  if (!context)
    throw new Error('useConversations must be inside ConversationProvider');
  return context;
};

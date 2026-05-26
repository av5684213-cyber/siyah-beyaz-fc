/**
 * Rival Manager Messaging Service
 * ⚠️ DEPRECATED — Bu dosya geriye dönük uyumluluk için re-export sağlar.
 * Tüm işlevsellik artık unifiedMessagingService.ts üzerinden yönetilmektedir.
 * Yeni kodlarda doğrudan '@/lib/fm/unifiedMessagingService' kullanın.
 */

export type {
  MessageCategory,
  ManagerConversation,
  ManagerMessage,
  ManagerPresence,
} from '@/lib/fm/unifiedMessagingService';

export type { ConversationWithMessages } from '@/lib/fm/unifiedMessagingService';

export {
  MESSAGE_CATEGORIES,
  QUICK_REPLIES,
  getOrCreateConversation,
  getMyConversations,
  sendDirectMessage as sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  getTotalUnreadCount,
  updateMyPresence,
  getManagerPresence,
  getMultiplePresence,
  searchRivalManagers,
  deleteMessage,
  subscribeToDirectMessages as subscribeToConversations,
  subscribeToConversationMessages,
  subscribeToPresence,
  unsubscribeFromChannel,
} from '@/lib/fm/unifiedMessagingService';

/**
 * Match Chat Service
 * ⚠️ DEPRECATED — Bu dosya geriye dönük uyumluluk için re-export sağlar.
 * Tüm işlevsellik artık unifiedMessagingService.ts üzerinden yönetilmektedir.
 * Yeni kodlarda doğrudan '@/lib/fm/unifiedMessagingService' kullanın.
 */

export type {
  MatchMessageType,
  MatchChatMessage,
  MatchEventPayload,
} from '@/lib/fm/unifiedMessagingService';

export {
  REACTION_EMOJIS,
  sendMatchChatMessage,
  sendMatchReaction,
  sendMatchEvent,
  loadMatchChat,
  subscribeToMatchChat,
  unsubscribeFromMatchChat,
  generateFixtureId,
} from '@/lib/fm/unifiedMessagingService';

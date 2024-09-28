import { ContentTypeId } from '@xmtp/content-type-primitives';

export interface XmtpMessage {
  senderAddress: string;
  content: string;
  sent: Date;
}

export interface User {
  user_id: number;
  active_roleplay_id: number | null;
  active_language: string;
  text_enabled: boolean;
  wallet_address: string;
  did: string;
}

export interface Message {
  message_id: number;
  user_id: number;
  message: string;
  created_at: string;
  role: 'user' | 'assistant';
  sequence_number: number;
  roleplay_id: number | null;
}

export interface SimilarMessage {
  message_id: number;
  role: 'user' | 'assistant';
  message: string;
  similarity: number;
  created_at: string;
}

export interface PersonalityData {
  id: number;
  message: string;
  similarity: number;
}

export interface DeckType {
  stream_id: string;
  controller: string;
  name: string;
  tags: string | null;
  status: string;
  creator: string;
  img_cid: string | null;
  description: string;
  base_language: string;
  reference_url: string | null;
  target_language_1: string;
  target_language_2: string | null;
}

export interface Flashcard {
  stream_id: string;
  controller: string;
  notes: string;
  deck_id: string;
  img_cid: string;
  tts_cid: string;
  base_word: string;
  base_language: string;
  translated_word_1: string;
  translated_language_1: string;
  _metadata_context?: string;
  plugins_data?: any;
  indexed_at: string;
}

export interface UserLearningData {
  stream_id?: string;
  controller?: string;
  flashcard_id: string;
  user_did: string;
  reps: number;
  state: number;
  lapses: number;
  stability: number;
  difficulty: number;
  last_review: string;
  next_review: string;
  last_interval: number;
  retrievability: number;
  _metadata_context?: string;
  plugins_data?: any;
  indexed_at?: string;
}

export interface Roleplay {
  roleplay_id: number;
  user_id: number;
  deck_id: string;
  status: 'active' | 'completed';
  created_at: string;
}

export const ContentTypeText = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "text",
  versionMajor: 1,
  versionMinor: 0
});
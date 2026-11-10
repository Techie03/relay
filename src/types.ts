export type UserId = string;
export type ChannelId = string;
export type MessageId = string;

export interface User {
  id: UserId;
  name: string;
  handle: string;
  role: string;
  /** Initials used as the avatar — no external images required. */
  initials: string;
  color: string;
  online: boolean;
}

export interface Reaction {
  emoji: string;
  userIds: UserId[];
}

export interface Message {
  id: MessageId;
  channelId: ChannelId;
  /** For DMs, channelId is the DM id (e.g. "dm-ada"). */
  authorId: UserId;
  text: string;
  createdAt: string; // ISO timestamp
  reactions: Reaction[];
  pinned: boolean;
  /** Message ids that reply to this message. */
  threadIds: MessageId[];
  /** If set, this message is a reply in a thread rooted at parentId. */
  parentId?: MessageId;
  mentions?: UserId[];
}

export interface Channel {
  id: ChannelId;
  name: string;
  description: string;
  memberCount: number;
  isPrivate?: boolean;
}

export interface DirectMessage {
  id: string;
  userId: UserId;
}

export type ConversationId = ChannelId | string;

export interface ExtractedItem {
  kind: "task" | "decision" | "question" | "note";
  text: string;
  owner?: string;
  sourceMessageId?: MessageId;
}

export interface AiSummary {
  title: string;
  bullets: string[];
  openQuestions: string[];
  participants: string[];
  messageCount: number;
}

export type AiMode = "summary" | "draft-reply" | "extract" | "rewrite" | "ask";

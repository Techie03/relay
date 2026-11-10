import type { Channel, DirectMessage, Message, User } from "../types";

export const CURRENT_USER_ID = "you";

export const users: User[] = [
  { id: "you", name: "Nishith Mareddy", handle: "nishith", role: "Founder · AI Engineer", initials: "NM", color: "#611f69", online: true },
  { id: "ada", name: "Ada Lovelace", handle: "ada", role: "ML Engineer", initials: "AL", color: "#2bac76", online: true },
  { id: "alan", name: "Alan Turing", handle: "alan", role: "Research Lead", initials: "AT", color: "#1264a3", online: true },
  { id: "grace", name: "Grace Hopper", handle: "grace", role: "Platform Engineer", initials: "GH", color: "#e8912d", online: false },
  { id: "linus", name: "Linus Torvalds", handle: "linus", role: "Infra · Open Source", initials: "LT", color: "#cd2553", online: true },
  { id: "marie", name: "Marie Curie", handle: "marie", role: "Data Scientist", initials: "MC", color: "#4a154b", online: true },
];

export const userById = (id: string): User =>
  users.find((u) => u.id === id) ?? users[0];

export const channels: Channel[] = [
  { id: "general", name: "general", description: "Company-wide announcements and conversation.", memberCount: 128 },
  { id: "ai-builders", name: "ai-builders", description: "Shipping RAG, agents, and LLM eval — demos welcome.", memberCount: 42 },
  { id: "random", name: "random", description: "Non-work banter, memes, and weekend plans.", memberCount: 96 },
];

export const directMessages: DirectMessage[] = [
  { id: "dm-ada", userId: "ada" },
  { id: "dm-alan", userId: "alan" },
  { id: "dm-marie", userId: "marie" },
];

export const initialMessages: Message[] = [
  // #general
  { id: "m1", channelId: "general", authorId: "alan", text: "Welcome to the new workspace! This is #general — announcements and big-picture discussion live here.", createdAt: "2026-11-10T14:02:00Z", reactions: [{ emoji: "👋", userIds: ["ada", "marie"] }], pinned: true, threadIds: ["m1r1"] },
  { id: "m1r1", channelId: "general", authorId: "ada", text: "Excited to be here. Should we pin a short guide for new members?", createdAt: "2026-11-10T14:05:00Z", reactions: [], pinned: false, threadIds: [], parentId: "m1" },
  { id: "m2", channelId: "general", authorId: "you", text: "Yes — I will draft it today. @ada can you review the AI panel copy once it is ready?", createdAt: "2026-11-10T14:20:00Z", reactions: [{ emoji: "✅", userIds: ["ada"] }], pinned: false, threadIds: [], mentions: ["ada"] },
  { id: "m3", channelId: "general", authorId: "grace", text: "Reminder: deploy freeze on Friday at 5pm. Please merge anything urgent before then.", createdAt: "2026-11-10T15:00:00Z", reactions: [], pinned: true, threadIds: [] },

  // #ai-builders
  { id: "a1", channelId: "ai-builders", authorId: "ada", text: "Shipped a first version of the RAG evaluator today — faithfulness, groundedness, and citation recall in one report.", createdAt: "2026-11-10T13:10:00Z", reactions: [{ emoji: "🔥", userIds: ["you", "alan", "marie"] }, { emoji: "🎉", userIds: ["linus"] }], pinned: false, threadIds: ["a1r1", "a1r2"] },
  { id: "a1r1", channelId: "ai-builders", authorId: "alan", text: "Nice. Did you use LLM-as-judge or a mix of heuristics + judge?", createdAt: "2026-11-10T13:14:00Z", reactions: [], pinned: false, threadIds: [], parentId: "a1" },
  { id: "a1r2", channelId: "ai-builders", authorId: "ada", text: "Both — heuristics catch the cheap failures, the judge scores nuance. I will post the eval set tomorrow.", createdAt: "2026-11-10T13:18:00Z", reactions: [{ emoji: "👍", userIds: ["alan"] }], pinned: false, threadIds: [], parentId: "a1" },
  { id: "a2", channelId: "ai-builders", authorId: "marie", text: "Question: how are folks chunking long PDFs for retrieval? 512 tokens with overlap, or semantic chunking?", createdAt: "2026-11-10T15:40:00Z", reactions: [], pinned: false, threadIds: ["a2r1"] },
  { id: "a2r1", channelId: "ai-builders", authorId: "you", text: "We use semantic chunking for reports and 512-token chunks for docs. The hybrid retriever (dense + BM25) helped recall a lot.", createdAt: "2026-11-10T15:52:00Z", reactions: [{ emoji: "💡", userIds: ["marie"] }], pinned: false, threadIds: [], parentId: "a2" },
  { id: "a3", channelId: "ai-builders", authorId: "linus", text: "TODO: add a guardrail check before the agent calls any external tool. @you can you own that?", createdAt: "2026-11-10T16:05:00Z", reactions: [], pinned: false, threadIds: [], mentions: ["you"] },
  { id: "a4", channelId: "ai-builders", authorId: "alan", text: "Decision: we will standardise on LangGraph for multi-agent flows. Simpler to trace and test than hand-rolled loops.", createdAt: "2026-11-10T16:20:00Z", reactions: [{ emoji: "✅", userIds: ["you", "ada"] }], pinned: false, threadIds: [] },

  // #random
  { id: "r1", channelId: "random", authorId: "linus", text: "Best coffee near the office? Asking for a friend (me).", createdAt: "2026-11-10T12:00:00Z", reactions: [{ emoji: "☕", userIds: ["grace", "marie"] }], pinned: false, threadIds: ["r1r1"] },
  { id: "r1r1", channelId: "random", authorId: "grace", text: "The one on 5th — oat latte is genuinely good.", createdAt: "2026-11-10T12:04:00Z", reactions: [], pinned: false, threadIds: [], parentId: "r1" },
  { id: "r2", channelId: "random", authorId: "marie", text: "Weekend hike, anyone? Saturday 8am, easy trail.", createdAt: "2026-11-10T17:00:00Z", reactions: [{ emoji: "🥾", userIds: ["you"] }], pinned: false, threadIds: [] },

  // DMs
  { id: "d1", channelId: "dm-ada", authorId: "ada", text: "Hey! Loved the catch-me-up summary in #ai-builders — can we add it to DMs too?", createdAt: "2026-11-10T15:30:00Z", reactions: [], pinned: false, threadIds: [] },
  { id: "d2", channelId: "dm-ada", authorId: "you", text: "Yes, it is on the list. The summariser already works on any conversation — just wiring the button in.", createdAt: "2026-11-10T15:33:00Z", reactions: [], pinned: false, threadIds: [] },
  { id: "d3", channelId: "dm-alan", authorId: "alan", text: "Can you send the eval report before Thursday's review?", createdAt: "2026-11-10T16:40:00Z", reactions: [], pinned: false, threadIds: [] },
  { id: "d4", channelId: "dm-marie", authorId: "marie", text: "Sharing the chunking notes doc in #ai-builders tomorrow morning.", createdAt: "2026-11-10T16:50:00Z", reactions: [], pinned: false, threadIds: [] },
];

export const channelLabel = (id: string): string => {
  const ch = channels.find((c) => c.id === id);
  if (ch) return `#${ch.name}`;
  const dm = directMessages.find((d) => d.id === id);
  if (dm) return userById(dm.userId).name;
  return id;
};

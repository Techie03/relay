import type { Message } from "../types";
import { userById } from "./seed";

/**
 * Semantic-style search ranking (local/demo implementation).
 * No embeddings and no network calls: it scores token overlap, author-name
 * matches, recency, and pinned messages, so results feel ranked rather
 * than purely chronological. Swap `scoreMessage` for an embedding cosine
 * similarity when a real vector index is available.
 */

const tokenize = (s: string): string[] =>
  s.toLowerCase().replace(/[^a-z0-9@#\s]/g, " ").split(/\s+/).filter(Boolean);

export interface ScoredMessage {
  message: Message;
  score: number;
  matchedTerms: string[];
}

export function scoreMessage(query: string, message: Message): ScoredMessage {
  const terms = tokenize(query);
  if (terms.length === 0) return { message, score: 0, matchedTerms: [] };
  const text = message.text.toLowerCase();
  const author = userById(message.authorId).name.toLowerCase();
  let score = 0;
  const matched: string[] = [];
  for (const term of terms) {
    if (text.includes(term)) {
      score += 3;
      matched.push(term);
      // Exact-word bonus over substring.
      if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)) score += 2;
    }
    if (author.includes(term)) score += 2;
  }
  if (message.pinned) score += 1;
  // Recency: small bonus for messages from the last day (seed data is recent).
  const ageHours = (Date.now() - new Date(message.createdAt).getTime()) / 3_600_000;
  if (ageHours < 24) score += 0.5;
  if (message.threadIds.length > 0) score += 0.5;
  return { message, score, matchedTerms: [...new Set(matched)] };
}

export function searchMessages(query: string, messages: Message[]): ScoredMessage[] {
  if (!query.trim()) return [];
  return messages
    .map((m) => scoreMessage(query, m))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function highlight(text: string, terms: string[]): string {
  // Plain-text helper for callers that render matches; the UI bolds via split.
  void terms;
  return text;
}

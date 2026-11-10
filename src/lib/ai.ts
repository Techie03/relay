import type { AiSummary, ExtractedItem, Message } from "../types";
import { userById } from "./seed";

/**
 * AI helpers — LOCAL / DEMO implementations.
 *
 * These run entirely client-side with no API key, using deterministic
 * extractive rules over the conversation text. They are honest stand-ins:
 * the same function signatures are used by the `/api/ai` route, so swapping
 * in a real LLM means replacing the body of these helpers (or calling the
 * API route) — not rewiring the UI.
 *
 * - summarizeConversation → extractive catch-me-up summary
 * - draftReply → template replies grounded in the last message
 * - extractTasks → task / decision / question extraction from a thread
 * - rewriteTone → tone rewrite + simple translation helper
 * - answerFromMessages → retrieval-style Q&A over the visible messages
 */

const firstSentence = (text: string): string => {
  const m = text.match(/^[^.!?]+[.!?]?/);
  return (m ? m[0] : text).trim();
};

const STOP = new Set([
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "is", "are",
  "we", "you", "i", "it", "this", "that", "with", "can", "will", "should",
  "have", "has", "was", "were", "be", "by", "at", "from", "as", "do", "does",
]);

function topKeywords(messages: Message[], limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const m of messages) {
    for (const w of m.text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
      if (w.length > 3 && !STOP.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w);
}

export function summarizeConversation(messages: Message[]): AiSummary {
  const roots = messages.filter((m) => !m.parentId);
  const participants = [...new Set(messages.map((m) => userById(m.authorId).name))];
  const keywords = topKeywords(messages);
  const bullets = roots.slice(0, 5).map(
    (m) => `${userById(m.authorId).name}: ${firstSentence(m.text)}`
  );
  const openQuestions = messages
    .filter((m) => m.text.includes("?"))
    .slice(0, 3)
    .map((m) => firstSentence(m.text));
  return {
    title: keywords.length ? `Catch-up: ${keywords.join(", ")}` : "Catch-up",
    bullets: bullets.length ? bullets : ["No messages yet in this conversation."],
    openQuestions,
    participants,
    messageCount: messages.length,
  };
}

export function draftReply(lastMessage: Message | undefined, tone: "friendly" | "concise" | "formal" = "friendly"): string[] {
  if (!lastMessage) return ["Thanks for sharing — I'll take a look and follow up shortly."];
  const author = userById(lastMessage.authorId).name.split(" ")[0];
  const topic = firstSentence(lastMessage.text).replace(/\s+/g, " ").slice(0, 80);
  const drafts: Record<typeof tone, string[]> = {
    friendly: [
      `Thanks ${author}! That makes sense — on "${topic}" I'll pick this up and share an update soon.`,
      `Love this, ${author} — happy to help with the next step. Want me to draft it?`,
      `Got it, ${author}. I'll review "${topic}" today and let you know what I find.`,
    ],
    concise: [
      `Thanks ${author} — noted, I'll follow up.`,
      `Confirmed. I'll handle the next step on this.`,
      `Thanks — reviewing now.`,
    ],
    formal: [
      `Thank you, ${author}. I have noted your update regarding "${topic}" and will revert with next steps.`,
      `Appreciate the update, ${author}. I will review and respond shortly.`,
    ],
  };
  return drafts[tone];
}

export function extractTasks(messages: Message[]): ExtractedItem[] {
  const items: ExtractedItem[] = [];
  for (const m of messages) {
    const text = m.text;
    const author = userById(m.authorId).name;
    if (/^(todo|task|action|please|can you|could you)\b/i.test(text) || /\bTODO\b/.test(text)) {
      items.push({ kind: "task", text: firstSentence(text), owner: author, sourceMessageId: m.id });
    } else if (/^decision:/i.test(text) || /\bdecided\b|\bwe will\b/i.test(text)) {
      items.push({ kind: "decision", text: firstSentence(text), owner: author, sourceMessageId: m.id });
    } else if (text.includes("?")) {
      items.push({ kind: "question", text: firstSentence(text), owner: author, sourceMessageId: m.id });
    }
  }
  if (items.length === 0 && messages.length > 0) {
    items.push({ kind: "note", text: firstSentence(messages[0].text), owner: userById(messages[0].authorId).name, sourceMessageId: messages[0].id });
  }
  return items;
}

export function rewriteTone(draft: string, tone: "friendly" | "concise" | "formal"): string {
  const clean = draft.trim();
  if (!clean) return "";
  if (tone === "concise") {
    return clean.split(/(?<=[.!?])\s+/).slice(0, 1).join(" ");
  }
  if (tone === "formal") {
    return clean.replace(/^hey\b/i, "Hello").replace(/^hi\b/i, "Hello").replace(/thanks!/i, "Thank you.");
  }
  // friendly
  return clean.endsWith("!") ? clean : `${clean.replace(/[.!?]+$/, "")} — happy to help!`;
}

/** Tiny built-in phrasebook for the draft translate helper (demo only). */
const PHRASEBOOK: Record<string, Record<string, string>> = {
  es: { hello: "Hola", thanks: "Gracias", "thank you": "Gracias", "good morning": "Buenos días" },
  fr: { hello: "Bonjour", thanks: "Merci", "thank you": "Merci", "good morning": "Bonjour" },
  de: { hello: "Hallo", thanks: "Danke", "thank you": "Danke", "good morning": "Guten Morgen" },
};

export function translateDraft(draft: string, lang: "es" | "fr" | "de"): string {
  let out = draft;
  const book = PHRASEBOOK[lang];
  for (const [en, tr] of Object.entries(book)) {
    out = out.replace(new RegExp(en, "gi"), tr);
  }
  return `${out} [demo translation to ${lang.toUpperCase()} — connect the /api/ai route for full translation]`;
}

export function answerFromMessages(question: string, messages: Message[]): string {
  const q = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const scored = messages
    .map((m) => ({
      m,
      score: q.filter((w) => m.text.toLowerCase().includes(w)).length,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  if (scored.length === 0) {
    return "I couldn't find anything about that in this conversation yet. Try asking about the eval report, chunking, LangGraph, or the deploy freeze — or ask in #ai-builders.";
  }
  const best = scored.slice(0, 2);
  return (
    `Based on this conversation:\n` +
    best.map((s) => `• ${userById(s.m.authorId).name}: ${firstSentence(s.m.text)}`).join("\n") +
    `\n(This is a local demo answer grounded in visible messages. With OPENAI_API_KEY set, /api/ai answers with a real LLM.)`
  );
}

/** Call the server AI route when a key is configured; falls back to local helpers. */
export async function callServerAi(mode: string, payload: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, ...payload }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    return data.text ?? null;
  } catch {
    return null;
  }
}

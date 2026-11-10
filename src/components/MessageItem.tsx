"use client";

import type { Message } from "../types";
import { userById } from "../lib/seed";

const EMOJIS = ["👍", "❤️", "🔥", "🎉", "💡", "✅"];

interface Props {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
  onOpenThread: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
  onMention: (userId: string) => void;
  highlightTerms?: string[];
}

function renderText(text: string, onMention: (userId: string) => void) {
  // Render @mentions as highlighted chips; everything else as plain text.
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const handle = part.slice(1);
      const user = { id: handle } as { id: string };
      return (
        <button key={i} onClick={() => onMention(user.id)} className="rounded bg-blue-100 px-1 font-medium text-blue-800 hover:bg-blue-200">
          {part}
        </button>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MessageItem({ message, onReact, onOpenThread, onTogglePin, onMention }: Props) {
  const author = userById(message.authorId);
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div className="group px-4 py-2 hover:bg-gray-50">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-xs font-bold text-white" style={{ background: author.color }}>
          {author.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-bold text-gray-900">{author.name}</span>
            <span className="text-xs text-gray-400">{time}</span>
            {message.pinned && <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[11px] font-semibold text-yellow-800">📌 Pinned</span>}
            {message.parentId && <span className="text-xs italic text-gray-400">in thread</span>}
          </div>
          <p className="whitespace-pre-wrap break-words text-[15px] text-gray-800">{renderText(message.text, onMention)}</p>

          {message.reactions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {message.reactions.map((r) => (
                <button key={r.emoji} onClick={() => onReact(message.id, r.emoji)} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs hover:border-gray-300" title={r.userIds.map((id) => userById(id).name).join(", ")}>
                  {r.emoji} {r.userIds.length}
                </button>
              ))}
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-1 opacity-0 transition group-hover:opacity-100">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => onReact(message.id, e)} className="rounded px-1 text-sm hover:bg-gray-200" title={`React ${e}`}>{e}</button>
            ))}
            <button onClick={() => onOpenThread(message.id)} className="rounded px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200">
              {message.threadIds.length > 0 ? `💬 ${message.threadIds.length} repl${message.threadIds.length === 1 ? "y" : "ies"}` : "💬 Reply in thread"}
            </button>
            <button onClick={() => onTogglePin(message.id)} className="rounded px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200">
              {message.pinned ? "Unpin" : "Pin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

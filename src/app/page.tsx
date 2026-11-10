"use client";

import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import MessageItem from "../components/MessageItem";
import Composer from "../components/Composer";
import AIPanel from "../components/AIPanel";
import type { Channel, Message } from "../types";
import { CURRENT_USER_ID, channels as seedChannels, channelLabel, directMessages, initialMessages } from "../lib/seed";
import { searchMessages } from "../lib/search";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [channels, setChannels] = useState<Channel[]>(seedChannels);
  const [activeId, setActiveId] = useState<string>("ai-builders");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [threadRootId, setThreadRootId] = useState<string | null>(null);
  const [showAi, setShowAi] = useState(true);
  const [composerDraft, setComposerDraft] = useState("");

  const activeChannel = channels.find((c) => c.id === activeId);
  const conversationMessages = useMemo(
    () => messages.filter((m) => m.channelId === activeId && !m.parentId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages, activeId]
  );

  const visibleMessages = useMemo(() => {
    let list = conversationMessages;
    if (showPinnedOnly) list = list.filter((m) => m.pinned);
    if (searchQuery.trim()) {
      const ids = new Set(searchMessages(searchQuery, messages).map((s) => s.message.id));
      list = list.filter((m) => ids.has(m.id));
    }
    return list;
  }, [conversationMessages, messages, searchQuery, showPinnedOnly]);

  const searchResults = useMemo(
    () => (searchQuery.trim() ? searchMessages(searchQuery, messages) : []),
    [searchQuery, messages]
  );

  const threadRoot = threadRootId ? messages.find((m) => m.id === threadRootId) : undefined;
  const threadMessages = useMemo(
    () => (threadRoot ? [threadRoot, ...messages.filter((m) => m.parentId === threadRoot.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))] : []),
    [messages, threadRoot]
  );

  const sendMessage = (text: string, parentId?: string, channelIdOverride?: string) => {
    const channelId = channelIdOverride ?? activeId;
    const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const msg: Message = {
      id,
      channelId,
      authorId: CURRENT_USER_ID,
      text,
      createdAt: new Date().toISOString(),
      reactions: [],
      pinned: false,
      threadIds: [],
      parentId,
    };
    setMessages((prev) => {
      const next = [...prev, msg];
      if (parentId) {
        return next.map((m) => (m.id === parentId ? { ...m, threadIds: [...m.threadIds, id] } : m));
      }
      return next;
    });
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (!existing) return { ...m, reactions: [...m.reactions, { emoji, userIds: [CURRENT_USER_ID] }] };
        const has = existing.userIds.includes(CURRENT_USER_ID);
        const userIds = has ? existing.userIds.filter((u) => u !== CURRENT_USER_ID) : [...existing.userIds, CURRENT_USER_ID];
        const reactions = userIds.length === 0 ? m.reactions.filter((r) => r.emoji !== emoji) : m.reactions.map((r) => (r.emoji === emoji ? { ...r, userIds } : r));
        return { ...m, reactions };
      })
    );
  };

  const togglePin = (messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m)));
  };

  const createChannel = () => {
    const name = window.prompt("New channel name (lowercase, no #):", "new-channel");
    if (!name) return;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") || "new-channel";
    if (channels.some((c) => c.id === slug)) {
      window.alert(`#${slug} already exists.`);
      return;
    }
    const ch: Channel = { id: slug, name: slug, description: "Created from the sidebar.", memberCount: 1 };
    setChannels((prev) => [...prev, ch]);
    setActiveId(slug);
    setThreadRootId(null);
  };

  const mentionUser = (handle: string) => {
    setSearchQuery("");
    window.alert(`Mention: @${handle} — in a real backend this would open that user's profile / DM.`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        channels={channels}
        dms={directMessages}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setThreadRootId(null); }}
        onCreateChannel={createChannel}
        unread={{}}
      />

      {/* Main pane */}
      <main className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900">{channelLabel(activeId)}</h1>
            <p className="truncate text-xs text-gray-500">{activeChannel ? `${activeChannel.description} · ${activeChannel.memberCount} members` : "Direct message"}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages…"
              className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-purple-500"
            />
            <button onClick={() => setShowPinnedOnly((v) => !v)} className={`rounded-lg border px-2 py-1.5 text-xs font-semibold ${showPinnedOnly ? "border-yellow-400 bg-yellow-100 text-yellow-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>
              📌 Pinned
            </button>
            <button onClick={() => setShowAi((v) => !v)} className="rounded-lg bg-relay-purple px-3 py-1.5 text-xs font-bold text-white hover:bg-relay-purpleLight">
              {showAi ? "Hide AI" : "✨ Show AI"}
            </button>
          </div>
        </header>

        {searchQuery.trim() && (
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-600">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"} for “{searchQuery}” — ranked by relevance (text match + author + pinned + recency).
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {visibleMessages.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              {searchQuery.trim() ? "No messages match that search in this workspace." : "No messages here yet — say hello below."}
            </p>
          ) : (
            visibleMessages.map((m) => (
              <MessageItem key={m.id} message={m} onReact={toggleReaction} onOpenThread={setThreadRootId} onTogglePin={togglePin} onMention={mentionUser} />
            ))
          )}
        </div>

        <Composer
          label={channelLabel(activeId)}
          lastMessage={conversationMessages[conversationMessages.length - 1]}
          onSend={(text) => sendMessage(text)}
          externalDraft={composerDraft}
          onExternalDraftConsumed={() => setComposerDraft("")}
        />
      </main>

      {/* Thread panel */}
      {threadRoot && (
        <section className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="font-bold text-gray-900">Thread</h2>
            <button onClick={() => setThreadRootId(null)} className="rounded px-2 py-0.5 text-gray-500 hover:bg-gray-100">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {threadMessages.map((m) => (
              <MessageItem key={m.id} message={m} onReact={toggleReaction} onOpenThread={setThreadRootId} onTogglePin={togglePin} onMention={mentionUser} />
            ))}
          </div>
          <Composer label="thread" lastMessage={threadMessages[threadMessages.length - 1]} onSend={(text) => sendMessage(text, threadRoot.id)} />
        </section>
      )}

      {/* AI panel */}
      {showAi && (
        <AIPanel
          conversationId={activeId}
          messages={messages.filter((m) => m.channelId === activeId)}
          threadMessages={threadMessages}
          onClose={() => setShowAi(false)}
          onInsertDraft={(text) => setComposerDraft(text)}
        />
      )}
    </div>
  );
}

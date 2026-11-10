"use client";

import { useMemo, useState } from "react";
import type { Message } from "../types";
import { answerFromMessages, callServerAi, extractTasks, summarizeConversation } from "../lib/ai";
import { channelLabel } from "../lib/seed";

interface Props {
  conversationId: string;
  messages: Message[];
  threadMessages: Message[];
  onClose: () => void;
  onInsertDraft: (text: string) => void;
}

export default function AIPanel({ conversationId, messages, threadMessages, onClose, onInsertDraft }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [serverNote, setServerNote] = useState("");
  const [busy, setBusy] = useState(false);

  const summary = useMemo(() => summarizeConversation(messages), [messages]);
  const tasks = useMemo(() => extractTasks(threadMessages.length ? threadMessages : messages), [messages, threadMessages]);

  const ask = async () => {
    if (!question.trim()) return;
    setBusy(true);
    setServerNote("");
    const server = await callServerAi("ask", { question, context: messages.slice(-10).map((m) => m.text) });
    if (server) {
      setAnswer(server);
      setServerNote("Answered by /api/ai (OpenAI).");
    } else {
      setAnswer(answerFromMessages(question, messages));
      setServerNote("Local demo answer — set OPENAI_API_KEY to use the real LLM via /api/ai.");
    }
    setBusy(false);
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="font-bold text-gray-900">✨ AI Assistant</h2>
        <button onClick={onClose} className="rounded px-2 py-0.5 text-gray-500 hover:bg-gray-100">✕</button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <section>
          <h3 className="text-sm font-semibold text-gray-900">Catch me up — {channelLabel(conversationId)}</h3>
          <p className="mt-1 text-xs text-gray-500">{summary.messageCount} messages · {summary.participants.join(", ")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-gray-800">
            {summary.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          {summary.openQuestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-700">Open questions</p>
              <ul className="list-disc pl-4 text-sm text-gray-700">
                {summary.openQuestions.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
          )}
          <button
            onClick={() => onInsertDraft(`Catch-up for ${channelLabel(conversationId)}: ${summary.bullets[0] ?? ""}`)}
            className="mt-2 rounded bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800 hover:bg-purple-200"
          >
            Insert summary into composer
          </button>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-900">Ask about this conversation</h3>
          <div className="mt-1 flex gap-1">
            <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} placeholder="e.g. What did we decide about LangGraph?" className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-purple-500" />
            <button onClick={ask} disabled={busy} className="rounded bg-relay-purple px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">{busy ? "…" : "Ask"}</button>
          </div>
          {answer && <p className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-2 text-sm text-gray-800">{answer}</p>}
          {serverNote && <p className="mt-1 text-[11px] text-gray-500">{serverNote}</p>}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-900">Tasks &amp; decisions {threadMessages.length ? "(open thread)" : "(this channel)"}</h3>
          <ul className="mt-2 space-y-1">
            {tasks.map((t, i) => (
              <li key={i} className="rounded border border-gray-200 px-2 py-1.5 text-sm">
                <span className={`mr-1 rounded px-1 py-0.5 text-[11px] font-bold ${t.kind === "task" ? "bg-blue-100 text-blue-800" : t.kind === "decision" ? "bg-green-100 text-green-800" : t.kind === "question" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"}`}>{t.kind}</span>
                {t.text} {t.owner ? <span className="text-xs text-gray-500">— {t.owner}</span> : null}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-gray-500">Extracted locally from message text. Swap extractTasks() for an LLM call for richer extraction.</p>
        </section>
      </div>
    </aside>
  );
}

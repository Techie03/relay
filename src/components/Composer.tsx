"use client";

import { useEffect, useState } from "react";
import { draftReply, rewriteTone, translateDraft } from "../lib/ai";
import type { Message } from "../types";

interface Props {
  label: string;
  onSend: (text: string) => void;
  lastMessage?: Message;
  externalDraft?: string;
  onExternalDraftConsumed?: () => void;
}

export default function Composer({ label, onSend, lastMessage, externalDraft, onExternalDraftConsumed }: Props) {
  const [text, setText] = useState("");
  const [showAi, setShowAi] = useState(false);
  const [tone, setTone] = useState<"friendly" | "concise" | "formal">("friendly");

  useEffect(() => {
    if (externalDraft) {
      setText(externalDraft);
      onExternalDraftConsumed?.();
    }
  }, [externalDraft, onExternalDraftConsumed]);

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    setShowAi(false);
  };

  const drafts = draftReply(lastMessage, tone);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {showAi && (
        <div className="mb-2 rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-purple-900">✨ Smart reply drafts</span>
            <select value={tone} onChange={(e) => setTone(e.target.value as typeof tone)} className="rounded border border-gray-300 bg-white px-1 py-0.5 text-xs">
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
              <option value="formal">Formal</option>
            </select>
            <button onClick={() => setShowAi(false)} className="ml-auto text-xs text-gray-500 hover:text-gray-800">Hide</button>
          </div>
          <div className="space-y-1">
            {drafts.map((d, i) => (
              <button key={i} onClick={() => setText(d)} className="block w-full rounded bg-white px-2 py-1.5 text-left text-sm text-gray-800 shadow-sm hover:bg-purple-100">
                {d}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <button onClick={() => setText((t) => rewriteTone(t || drafts[0], "concise"))} className="rounded bg-white px-2 py-1 text-xs font-medium text-purple-800 shadow-sm hover:bg-purple-100">Make concise</button>
            <button onClick={() => setText((t) => rewriteTone(t || drafts[0], "formal"))} className="rounded bg-white px-2 py-1 text-xs font-medium text-purple-800 shadow-sm hover:bg-purple-100">Make formal</button>
            <button onClick={() => setText((t) => translateDraft(t || drafts[0], "es"))} className="rounded bg-white px-2 py-1 text-xs font-medium text-purple-800 shadow-sm hover:bg-purple-100">Translate → ES</button>
            <button onClick={() => setText((t) => translateDraft(t || drafts[0], "fr"))} className="rounded bg-white px-2 py-1 text-xs font-medium text-purple-800 shadow-sm hover:bg-purple-100">Translate → FR</button>
          </div>
          <p className="mt-2 text-[11px] text-purple-700">Local demo helpers — tone / translate use rules, not an LLM. Connect /api/ai for real rewrites.</p>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={2}
          placeholder={`Message ${label} — @mention a teammate, Shift+Enter for a new line`}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
        <div className="flex flex-col gap-1">
          <button onClick={() => setShowAi((v) => !v)} className="rounded-lg border border-purple-300 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-100">✨ AI draft</button>
          <button onClick={send} disabled={!text.trim()} className="rounded-lg bg-relay-green px-3 py-1.5 text-xs font-bold text-white hover:bg-green-600 disabled:opacity-40">Send</button>
        </div>
      </div>
    </div>
  );
}

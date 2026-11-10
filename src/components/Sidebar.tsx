"use client";

import type { Channel, DirectMessage } from "../types";
import { userById } from "../lib/seed";

interface Props {
  channels: Channel[];
  dms: DirectMessage[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreateChannel: () => void;
  unread: Record<string, number>;
}

export default function Sidebar({ channels, dms, activeId, onSelect, onCreateChannel, unread }: Props) {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-relay-aubergine text-white">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-lg font-bold leading-tight">Relay</p>
        <p className="text-xs text-white/60">AI Builders workspace · AI-enhanced</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="mb-1 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Channels</span>
          <button onClick={onCreateChannel} title="Create channel" className="rounded px-1 text-white/70 hover:bg-white/10 hover:text-white">+</button>
        </div>
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${activeId === ch.id ? "bg-relay-purpleLight text-white" : "text-white/80 hover:bg-white/10"}`}
          >
            <span className="truncate"># {ch.name}</span>
            {unread[ch.id] ? <span className="rounded-full bg-red-500 px-1.5 text-[11px] font-bold">{unread[ch.id]}</span> : null}
          </button>
        ))}

        <div className="mb-1 mt-5 px-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Direct messages</span>
        </div>
        {dms.map((dm) => {
          const u = userById(dm.userId);
          return (
            <button
              key={dm.id}
              onClick={() => onSelect(dm.id)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${activeId === dm.id ? "bg-relay-purpleLight text-white" : "text-white/80 hover:bg-white/10"}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold" style={{ background: u.color }}>
                {u.initials}
              </span>
              <span className="truncate">{u.name}</span>
              <span className={`ml-auto h-2 w-2 rounded-full ${u.online ? "bg-green-400" : "bg-white/30"}`} title={u.online ? "Online" : "Away"} />
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-4 py-3 text-xs text-white/60">
        <p>Demo data — messages are stored in browser state only.</p>
        <p className="mt-1">AI panel: local demo, no key needed.</p>
      </div>
    </aside>
  );
}

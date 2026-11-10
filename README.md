# Relay

**Relay** is an AI-enhanced team workspace — similar in spirit to Slack, but not Slack. Channels, threads, and DMs, with a built-in AI assistant that helps you catch up, draft replies, find things, and turn conversations into tasks.

> Live demo: run it locally (see below). No backend or API key is required for the demo — the AI helpers run locally in the browser. Set `OPENAI_API_KEY` to swap in a real LLM via `/api/ai`.

GitHub: **Techie03/relay**

## Features

### Workspace
- **3-pane layout** — workspace sidebar, main message pane, AI panel (plus a thread panel when a thread is open)
- **Channels** — `#general`, `#ai-builders`, `#random` seeded, plus create-your-own from the sidebar (`+`)
- **Direct messages** — seeded DMs with Ada, Alan, and Marie, with online indicators
- **Switch channels / DMs** instantly; state is held client-side in React state
- **Seed data** — 6 users (initials avatars, no external images), messages with reactions, threads, pinned messages, and mentions

### Messaging
- **Send messages** — Enter to send, Shift+Enter for a new line
- **Threads / replies** — reply in thread, thread panel shows the root + replies
- **Reactions** — hover a message for quick emoji reactions, toggle your own reaction on/off
- **Pin messages** — pin / unpin, and filter to pinned-only
- **Mentions** — `@name` renders as a highlighted chip
- **Search** — ranked search across all messages (see AI below)

### AI features
All AI features work **without an API key** using honest, local/demo implementations in `src/lib/ai.ts` and `src/lib/search.ts`. They are labelled as such in the UI and in code, and each has the same shape as the real-LLM path so swapping is a one-function change.

| Feature | Where | How it works (demo) | Real-LLM path |
|---|---|---|---|
| **Catch-me-up summary** | AI panel | Extractive summary: top keywords, per-message bullets, open questions, participants | `POST /api/ai` `mode: "summary"` |
| **AI assistant Q&A** | AI panel — "Ask about this conversation" | Retrieval-style answer grounded in the visible messages | `POST /api/ai` `mode: "ask"` |
| **Smart reply drafts** | Composer — "✨ AI draft" | Template drafts grounded in the last message, in friendly / concise / formal tone | `POST /api/ai` `mode: "draft-reply"` |
| **Semantic-style search** | Header search | Token-overlap ranking + author, pinned, and recency bonuses | Swap `scoreMessage()` for embedding cosine similarity |
| **Tasks & decisions extraction** | AI panel | Rule-based extraction of tasks / decisions / questions from a thread or channel | `POST /api/ai` `mode: "extract"` |
| **Tone rewrite / translate** | Composer AI draft panel | Rule-based concise / formal rewrite; small phrasebook ES/FR/DE translate | `POST /api/ai` `mode: "rewrite"` |

## How to run

```bash
# 1. Install dependencies
npm install

# 2. (Optional) enable the real LLM path
cp .env.example .env.local
# then set OPENAI_API_KEY in .env.local

# 3. Start the dev server
npm run dev
# Open http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

Requirements: Node.js >= 18.17.

## Environment variables

| Variable | Required? | Default | Purpose |
|---|---|---|---|
| `OPENAI_API_KEY` | No | — | Enables the real LLM in `src/app/api/ai/route.ts`. Without it, the route returns `501` and the UI falls back to the local demo helpers. |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Model used by `/api/ai` when a key is set. |

Copy `.env.example` to `.env.local` — `.env.local` is git-ignored, never commit a real key.

## Architecture

```
relay/
├── package.json                 # Next.js 14, React 18, Tailwind 3, TypeScript
├── tailwind.config.js           # Relay brand colours (relay.purple / green / aubergine)
├── next.config.js / tsconfig.json / postcss.config.js
├── .env.example                 # OPENAI_API_KEY (optional)
└── src/
    ├── app/
    │   ├── layout.tsx           # Root layout, metadata: "Relay"
    │   ├── page.tsx             # The app: state, 3-pane layout, search / pin filter
    │   ├── globals.css          # Tailwind directives
    │   └── api/ai/route.ts      # POST /api/ai — 501 without a key, OpenAI fetch with one
    ├── components/
    │   ├── Sidebar.tsx          # Relay branding, channels, DMs, create channel
    │   ├── MessageItem.tsx      # Avatar, mentions, reactions, thread / pin actions
    │   ├── Composer.tsx         # Send box + smart-reply drafts, tone / translate
    │   └── AIPanel.tsx          # Catch-me-up, Ask, tasks & decisions
    ├── lib/
    │   ├── seed.ts              # Users, channels, DMs, initial messages
    │   ├── ai.ts                # summarizeConversation, draftReply, extractTasks,
    │   │                        # rewriteTone, translateDraft, answerFromMessages,
    │   │                        # callServerAi — local/demo, swappable for the LLM
    │   └── search.ts            # scoreMessage / searchMessages (ranked search)
    └── types.ts                 # User, Channel, Message, Reaction, AiSummary, …
```

State: all chat state lives in `src/app/page.tsx` with `useState` — no database, no backend required for the demo. Messages, reactions, pins, threads, and new channels are in-memory (browser state only, reset on reload). That is deliberate for v1: persistence (database / realtime / auth) is the next milestone, not hidden behind a stub.

## Honest limitations (v1)

- No persistence — reload resets to seed data.
- No auth, no real-time sync, no file uploads — single-user demo in the browser.
- AI helpers are local/demo rules, not a model, until `OPENAI_API_KEY` is set.
- Avatars are initials, not photos.

## Contributing

PRs welcome. Keep the AI helpers honest: if a feature is a demo rule, label it as one in the UI and in the code comment, and keep the `/api/ai` shape as the upgrade path.

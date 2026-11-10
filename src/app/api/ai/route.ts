import { NextResponse } from "next/server";

/**
 * POST /api/ai — optional real-LLM path.
 *
 * Body: { mode: "ask" | "summary" | "draft-reply" | "extract" | "rewrite",
 *         question?: string, context?: string[], text?: string }
 *
 * - Without OPENAI_API_KEY: returns 501 with a clear message. The UI then
 *   falls back to the local/demo helpers in src/lib/ai.ts, so the app
 *   works fully offline.
 * - With OPENAI_API_KEY set: calls OpenAI Chat Completions with fetch
 *   (no extra dependencies) and returns { text }.
 */
export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "OPENAI_API_KEY is not set. The app uses local/demo AI helpers instead — see src/lib/ai.ts. Set OPENAI_API_KEY in .env.local to enable the real LLM path.",
      },
      { status: 501 }
    );
  }

  let body: { mode?: string; question?: string; context?: string[]; text?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const context = (body.context ?? []).join("\n").slice(0, 6000);
  const prompt =
    body.mode === "ask"
      ? `Answer this question using only the conversation below. If the answer is not in the conversation, say so.\n\nConversation:\n${context}\n\nQuestion: ${body.question ?? ""}`
      : body.mode === "summary"
        ? `Summarise this conversation in 4-6 short bullets, plus open questions.\n\n${context}`
        : body.mode === "extract"
          ? `Extract tasks, decisions, and open questions from this conversation as a short list.\n\n${context}`
          : `Rewrite the following text helpfully:\n\n${body.text ?? ""}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a helpful assistant inside a Relay team workspace. Be concise and grounded in the provided conversation." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: `OpenAI request failed (${res.status}).`, detail: detail.slice(0, 500) }, { status: 502 });
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: "Failed to reach OpenAI.", detail: String(err).slice(0, 500) }, { status: 502 });
  }
}

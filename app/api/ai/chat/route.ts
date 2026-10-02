import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

const SYSTEM = `You are CTP Alpha AI, the analytical assistant inside CTP Alpha Terminal.
Use supplied terminal data and never invent missing facts. Separate OBSERVED, INFERENCE, and UNKNOWN.
For market analysis cover regime, news/narrative, on-chain evidence, smart money, liquidity/manipulation risks, bull case, bear case, invalidation, risk notes, and data gaps.
Never guarantee an outcome.`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const baseUrl = (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
  const model = process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "NVIDIA_API_KEY belum diatur di .env.local/.env" }, { status: 400 });

  const temperature = Number.isFinite(Number(process.env.NVIDIA_TEMPERATURE)) ? Number(process.env.NVIDIA_TEMPERATURE) : 0.15;
  const maxTokens = Number.isInteger(Number(process.env.NVIDIA_MAX_TOKENS)) ? Number(process.env.NVIDIA_MAX_TOKENS) : 4096;
  const reasoningEffort = ["none", "medium", "high"].includes(process.env.NVIDIA_REASONING_EFFORT || "")
    ? process.env.NVIDIA_REASONING_EFFORT
    : "medium";

  const requestBody: Record<string, unknown> = {
    model,
    messages: [{ role: "system", content: SYSTEM }, { role: "user", content: message }],
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };
  if (reasoningEffort !== "none") requestBody.reasoning_effort = reasoningEffort;
  if (process.env.NVIDIA_ENABLE_THINKING !== "false") {
    requestBody.chat_template_kwargs = { enable_thinking: true };
  }

  const response = await fetch(baseUrl + "/chat/completions", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(Number(process.env.NVIDIA_TIMEOUT_MS) || 120000),
  });
  const raw = await response.text();
  let data: { choices?: Array<{message?: {content?: string|null}}>; model?: string; usage?: unknown; error?: {message?: string} };
  try { data = JSON.parse(raw); } catch { return NextResponse.json({ error: "AI provider returned invalid JSON" }, { status: 502 }); }
  if (!response.ok) return NextResponse.json({ error: data.error?.message || raw.slice(0,500) }, { status: 502 });
  const answer = data.choices?.[0]?.message?.content || "";
  if (!answer) return NextResponse.json({ error: "AI provider returned an empty answer" }, { status: 502 });
  return NextResponse.json({ provider: "nvidia", model: data.model || model, answer, usage: data.usage || null });
}

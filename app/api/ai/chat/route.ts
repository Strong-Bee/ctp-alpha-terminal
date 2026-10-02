import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/telegram";

export const runtime = "nodejs";

const SYSTEM = `You are CTP Alpha AI, the analytical assistant inside CTP Alpha Terminal.
Use supplied terminal data and never invent missing facts. Separate OBSERVED, INFERENCE, and UNKNOWN.
For market analysis cover regime, news/narrative, on-chain evidence, smart money, liquidity/manipulation risks, bull case, bear case, invalidation, risk notes, and data gaps.
Never guarantee an outcome.`;

export async function POST(request: Request) {
  const session = await auth();
  const userEmail = session?.user?.email?.trim().toLowerCase();
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const saved = await prisma.userAISettings.findUnique({ where: { userEmail } });
  const baseUrl = saved?.baseUrl || process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
  const model = saved?.model || process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";
  const apiKey = saved?.apiKeyEncrypted ? decryptSecret(saved.apiKeyEncrypted) : process.env.NVIDIA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI API key is not configured. Open AI Assistant → Model Settings." }, { status: 400 });

  const requestBody: Record<string, unknown> = {
    model,
    messages: [{ role: "system", content: SYSTEM }, { role: "user", content: message }],
    temperature: saved?.temperature ?? 0.15,
    max_tokens: saved?.maxTokens ?? 4096,
    stream: false,
  };
  if (saved?.reasoningEffort) requestBody.reasoning_effort = saved.reasoningEffort;
  else requestBody.extra_body = { chat_template_kwargs: { enable_thinking: true } };

  const response = await fetch(baseUrl.replace(/\/$/, "") + "/chat/completions", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify(requestBody),
  });
  const raw = await response.text();
  let data: { choices?: Array<{message?: {content?: string|null}}>; model?: string; usage?: unknown; error?: {message?: string} };
  try { data = JSON.parse(raw); } catch { return NextResponse.json({ error: "AI provider returned invalid JSON" }, { status: 502 }); }
  if (!response.ok) return NextResponse.json({ error: data.error?.message || raw.slice(0,500) }, { status: 502 });
  const answer = data.choices?.[0]?.message?.content || "";
  if (!answer) return NextResponse.json({ error: "AI provider returned an empty answer" }, { status: 502 });
  return NextResponse.json({ provider: saved?.provider || "nvidia", model: data.model || model, answer, usage: data.usage || null });
}

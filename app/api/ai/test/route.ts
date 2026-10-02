import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const startedAt = Date.now();
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const baseUrl = (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
    const model = process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "NVIDIA_API_KEY belum diatur di .env.local/.env" }, { status: 400 });

    const temperature = Number.isFinite(Number(process.env.NVIDIA_TEMPERATURE)) ? Number(process.env.NVIDIA_TEMPERATURE) : 0.15;
    const reasoningEffort = ["none", "medium", "high"].includes(process.env.NVIDIA_REASONING_EFFORT || "") ? process.env.NVIDIA_REASONING_EFFORT : "medium";
    const requestBody: Record<string, unknown> = {
      model,
      messages: [{ role: "user", content: "Reply with exactly: CTP AI connection OK" }],
      temperature,
      max_tokens: 256,
      stream: false,
    };
    if (reasoningEffort !== "none") requestBody.reasoning_effort = reasoningEffort;
    if (process.env.NVIDIA_ENABLE_THINKING !== "false") requestBody.chat_template_kwargs = { enable_thinking: true };

    const response = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000),
    });
    const raw = await response.text();
    let data: { choices?: Array<{ message?: { content?: string | null } }>; model?: string; usage?: unknown; error?: { message?: string } };
    try { data = JSON.parse(raw); } catch { return NextResponse.json({ error: "Provider mengembalikan response bukan JSON", latencyMs: Date.now() - startedAt }, { status: 502 }); }
    if (!response.ok) return NextResponse.json({ error: data.error?.message || raw.slice(0, 500), latencyMs: Date.now() - startedAt }, { status: 502 });
    const answer = data.choices?.[0]?.message?.content?.trim() || "";
    if (!answer) return NextResponse.json({ error: "Provider terhubung tetapi answer kosong", latencyMs: Date.now() - startedAt }, { status: 502 });
    return NextResponse.json({ ok: true, provider: "nvidia", model: data.model || model, answer, latencyMs: Date.now() - startedAt, usage: data.usage || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection test failed";
    return NextResponse.json({ error: message.toLowerCase().includes("timeout") || message.toLowerCase().includes("aborted") ? "Request ke AI provider timeout setelah 30 detik" : message, latencyMs: Date.now() - startedAt }, { status: 502 });
  }
}

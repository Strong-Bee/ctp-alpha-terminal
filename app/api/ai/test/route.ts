import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestBody = {
  provider?: string;
  baseUrl?: string;
  model?: string;
  apiKey?: string;
  reasoningEffort?: string;
  temperature?: number;
  maxTokens?: number;
  enableThinking?: boolean;
};

export async function POST(request: Request) {
  const startedAt = Date.now();
  const session = await auth();
  const userEmail = session?.user?.email?.trim().toLowerCase();
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json().catch(() => ({}))) as TestBody;
    const saved = await prisma.userAISettings.findUnique({ where: { userEmail } });

    const baseUrl = String(body.baseUrl || saved?.baseUrl || process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").trim().replace(/\/$/, "");
    const model = String(body.model || saved?.model || process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b").trim();
    const provider = String(body.provider || saved?.provider || "nvidia").trim().toLowerCase();
    const apiKeyInput = String(body.apiKey || "").trim();
    const apiKey = apiKeyInput || (saved?.apiKeyEncrypted ? decryptSecret(saved.apiKeyEncrypted) : process.env.NVIDIA_API_KEY);

    if (!/^https:\/\//i.test(baseUrl)) {
      return NextResponse.json({ error: "Base URL harus menggunakan HTTPS" }, { status: 400 });
    }
    if (!model) return NextResponse.json({ error: "Model wajib diisi" }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "API key belum tersedia. Isi API key atau simpan AI Settings terlebih dahulu." }, { status: 400 });

    const temperature = Number(body.temperature ?? saved?.temperature ?? 0.15);
    const maxTokens = Number(body.maxTokens ?? saved?.maxTokens ?? 256);
    const reasoningEffort = ["none", "medium", "high"].includes(String(body.reasoningEffort ?? saved?.reasoningEffort))
      ? String(body.reasoningEffort ?? saved?.reasoningEffort)
      : "medium";
    if (!Number.isFinite(temperature) || temperature < 0 || temperature > 1) {
      return NextResponse.json({ error: "Temperature harus 0 sampai 1" }, { status: 400 });
    }
    if (!Number.isInteger(maxTokens) || maxTokens < 64 || maxTokens > 32768) {
      return NextResponse.json({ error: "Max Tokens harus 64 sampai 32768" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    };
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = "https://cybertechnologyproject.my.id";
      headers["X-Title"] = "CTP Alpha Terminal";
    }

    const requestBody: Record<string, unknown> = {
      model,
      messages: [{ role: "user", content: "Reply with exactly: CTP AI connection OK" }],
      temperature,
      max_tokens: Math.min(maxTokens, 256),
      stream: false,
    };

    if (reasoningEffort !== "none") requestBody.reasoning_effort = reasoningEffort;
    if (body.enableThinking ?? saved?.enableThinking ?? true) {
      requestBody.extra_body = { chat_template_kwargs: { enable_thinking: true } };
    }

    const response = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30_000),
    });

    const raw = await response.text();
    let data: {
      choices?: Array<{ message?: { content?: string | null } }>;
      model?: string;
      usage?: unknown;
      error?: { message?: string };
    };
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Provider mengembalikan response bukan JSON", status: response.status, latencyMs: Date.now() - startedAt },
        { status: 502 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.error?.message || raw.slice(0, 500) || "Provider request failed",
          status: response.status,
          latencyMs: Date.now() - startedAt,
        },
        { status: 502 },
      );
    }

    const answer = data.choices?.[0]?.message?.content?.trim() || "";
    if (!answer) {
      return NextResponse.json(
        { error: "Provider terhubung tetapi mengembalikan answer kosong", status: response.status, latencyMs: Date.now() - startedAt },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      provider,
      model: data.model || model,
      answer,
      latencyMs: Date.now() - startedAt,
      usage: data.usage || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection test failed";
    const timeout = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("aborted");
    return NextResponse.json(
      { error: timeout ? "Request ke AI provider timeout setelah 30 detik" : message, latencyMs: Date.now() - startedAt },
      { status: 502 },
    );
  }
}

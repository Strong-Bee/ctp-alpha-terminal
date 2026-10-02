import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaults = {
  provider: "nvidia",
  baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  model: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b",
  enableThinking: process.env.NVIDIA_ENABLE_THINKING !== "false",
  reasoningEffort: "medium",
  temperature: 0.15,
  maxTokens: 4096,
};

async function getUserEmail() {
  const session = await auth();
  return session?.user?.email?.trim().toLowerCase() || null;
}

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  if (message.includes("UserAISettings") && (message.includes("does not exist") || message.includes("Unknown field"))) {
    return NextResponse.json(
      { error: "Database belum memiliki tabel UserAISettings. Jalankan: npx prisma generate && npx prisma migrate deploy" },
      { status: 503 },
    );
  }
  return NextResponse.json({ error: message || fallback }, { status: 500 });
}

export async function GET() {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const saved = await prisma.userAISettings.findUnique({ where: { userEmail } });
    return NextResponse.json({
      settings: {
        provider: saved?.provider ?? defaults.provider,
        baseUrl: saved?.baseUrl ?? defaults.baseUrl,
        model: saved?.model ?? defaults.model,
        enableThinking: saved?.enableThinking ?? defaults.enableThinking,
        reasoningEffort: saved?.reasoningEffort ?? defaults.reasoningEffort,
        temperature: saved?.temperature ?? defaults.temperature,
        maxTokens: saved?.maxTokens ?? defaults.maxTokens,
        apiKeyConfigured: Boolean(saved?.apiKeyEncrypted || process.env.NVIDIA_API_KEY),
      },
    });
  } catch (error) {
    return errorResponse(error, "Failed to load AI settings");
  }
}

export async function POST(request: Request) {
  const userEmail = await getUserEmail();
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const provider = String((body as Record<string, unknown>).provider || "nvidia").trim().toLowerCase();
    const baseUrl = String((body as Record<string, unknown>).baseUrl || "").trim().replace(/\/$/, "");
    const model = String((body as Record<string, unknown>).model || "").trim();
    const apiKey = String((body as Record<string, unknown>).apiKey || "").trim();
    const temperature = Number((body as Record<string, unknown>).temperature);
    const maxTokens = Number((body as Record<string, unknown>).maxTokens);
    const reasoningEffort = ["none", "medium", "high"].includes(String((body as Record<string, unknown>).reasoningEffort))
      ? String((body as Record<string, unknown>).reasoningEffort)
      : "medium";
    const enableThinking = (body as Record<string, unknown>).enableThinking !== false;

    if (!["nvidia", "openai", "openrouter", "custom"].includes(provider)) {
      return NextResponse.json({ error: "Unsupported AI provider" }, { status: 400 });
    }
    if (!baseUrl || !model) {
      return NextResponse.json({ error: "Base URL and model are required" }, { status: 400 });
    }
    if (!/^https:\/\//i.test(baseUrl)) {
      return NextResponse.json({ error: "Base URL must use HTTPS" }, { status: 400 });
    }
    if (!Number.isFinite(temperature) || temperature < 0 || temperature > 1) {
      return NextResponse.json({ error: "Temperature must be between 0 and 1" }, { status: 400 });
    }
    if (!Number.isInteger(maxTokens) || maxTokens < 64 || maxTokens > 32768) {
      return NextResponse.json({ error: "Max tokens must be between 64 and 32768" }, { status: 400 });
    }

    const existing = await prisma.userAISettings.findUnique({ where: { userEmail } });
    const encryptedApiKey = apiKey ? encryptSecret(apiKey) : existing?.apiKeyEncrypted ?? null;

    const saved = await prisma.userAISettings.upsert({
      where: { userEmail },
      create: {
        userEmail,
        provider,
        baseUrl,
        model,
        apiKeyEncrypted: encryptedApiKey,
        enableThinking,
        reasoningEffort,
        temperature,
        maxTokens,
      },
      update: {
        provider,
        baseUrl,
        model,
        apiKeyEncrypted: encryptedApiKey,
        enableThinking,
        reasoningEffort,
        temperature,
        maxTokens,
      },
    });

    return NextResponse.json({
      ok: true,
      settings: {
        provider: saved.provider,
        baseUrl: saved.baseUrl,
        model: saved.model,
        enableThinking: saved.enableThinking,
        reasoningEffort: saved.reasoningEffort,
        temperature: saved.temperature,
        maxTokens: saved.maxTokens,
        apiKeyConfigured: Boolean(saved.apiKeyEncrypted || process.env.NVIDIA_API_KEY),
      },
    });
  } catch (error) {
    return errorResponse(error, "Failed to save AI settings");
  }
}

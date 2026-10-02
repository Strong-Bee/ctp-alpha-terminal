import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/telegram";

export const runtime = "nodejs";

const defaults = {
  provider: process.env.NVIDIA_API_KEY ? "nvidia" : "nvidia",
  baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  model: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b",
  enableThinking: process.env.NVIDIA_ENABLE_THINKING !== "false",
  reasoningEffort: "medium",
  temperature: 0.15,
  maxTokens: 4096,
};

async function email() {
  const session = await auth();
  return session?.user?.email?.trim().toLowerCase() || null;
}

export async function GET() {
  const userEmail = await email();
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
}

export async function POST(request: Request) {
  const userEmail = await email();
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const provider = String(body.provider || "nvidia");
  const baseUrl = String(body.baseUrl || "").trim().replace(/\/$/, "");
  const model = String(body.model || "").trim();
  const apiKey = String(body.apiKey || "").trim();
  const temperature = Number(body.temperature);
  const maxTokens = Number(body.maxTokens);
  const reasoningEffort = ["none","medium","high"].includes(body.reasoningEffort) ? body.reasoningEffort : "medium";
  if (!baseUrl || !model) return NextResponse.json({ error: "Base URL and model are required" }, { status: 400 });
  if (!/^https:\/\//i.test(baseUrl)) return NextResponse.json({ error: "Base URL must use HTTPS" }, { status: 400 });
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 1) return NextResponse.json({ error: "Temperature must be 0..1" }, { status: 400 });
  if (!Number.isInteger(maxTokens) || maxTokens < 64 || maxTokens > 32768) return NextResponse.json({ error: "Max tokens must be 64..32768" }, { status: 400 });

  const saved = await prisma.userAISettings.upsert({
    where: { userEmail },
    create: {
      userEmail, provider, baseUrl, model,
      apiKeyEncrypted: apiKey ? encryptSecret(apiKey) : null,
      enableThinking: body.enableThinking !== false, reasoningEffort, temperature, maxTokens,
    },
    update: {
      provider, baseUrl, model,
      ...(apiKey ? { apiKeyEncrypted: encryptSecret(apiKey) } : {}),
      enableThinking: body.enableThinking !== false, reasoningEffort, temperature, maxTokens,
    },
  });
  return NextResponse.json({ ok: true, apiKeyConfigured: Boolean(saved.apiKeyEncrypted || process.env.NVIDIA_API_KEY) });
}

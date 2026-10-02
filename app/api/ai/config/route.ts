import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getEnvSettings = () => ({
  provider: process.env.NVIDIA_PROVIDER || "nvidia",
  baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  model: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b",
  enableThinking: process.env.NVIDIA_ENABLE_THINKING !== "false",
  reasoningEffort: ["none", "medium", "high"].includes(process.env.NVIDIA_REASONING_EFFORT || "")
    ? process.env.NVIDIA_REASONING_EFFORT
    : "medium",
  temperature: Number.isFinite(Number(process.env.NVIDIA_TEMPERATURE)) ? Number(process.env.NVIDIA_TEMPERATURE) : 0.15,
  maxTokens: Number.isInteger(Number(process.env.NVIDIA_MAX_TOKENS)) ? Number(process.env.NVIDIA_MAX_TOKENS) : 4096,
  apiKeyConfigured: Boolean(process.env.NVIDIA_API_KEY),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: getEnvSettings(), source: "env" });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    error: "AI settings menggunakan ENV server. Edit file .env.local/.env lalu restart aplikasi.",
    settings: getEnvSettings(),
    source: "env",
  }, { status: 400 });
}

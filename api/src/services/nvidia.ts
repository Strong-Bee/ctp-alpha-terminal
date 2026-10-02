import { env } from "../config/env.js";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type NvidiaChatOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: "none" | "medium" | "high";
};

const BASE_URL = env.NVIDIA_BASE_URL.replace(/\/$/, "");

export async function nvidiaChat(options: NvidiaChatOptions) {
  if (!env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not configured on the API server");
  }

  const body: Record<string, unknown> = {
    model: env.NVIDIA_MODEL,
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 4096,
    stream: false,
  };

  // NVIDIA's current API supports reasoning_effort for Nemotron Ultra.
  // Keep the legacy chat_template option too for compatibility with NIM.
  if (options.reasoningEffort) {
    body.reasoning_effort = options.reasoningEffort;
  } else {
    body.extra_body = {
      chat_template_kwargs: {
        enable_thinking: env.NVIDIA_ENABLE_THINKING,
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.NVIDIA_TIMEOUT_MS);

  let response: Response;
  let raw = "";
  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    raw = await response.text();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`NVIDIA API timeout after ${env.NVIDIA_TIMEOUT_MS}ms`);
    }
    throw new Error(`NVIDIA API network error: ${error instanceof Error ? error.message : "unknown error"}`);
  } finally {
    clearTimeout(timeout);
  }

  let payload: {
    choices?: Array<{
      message?: { content?: string | null; reasoning_content?: string | null };
    }>;
    model?: string;
    usage?: Record<string, unknown>;
    error?: { message?: string; type?: string; code?: string };
    requestId?: string;
  };

  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error(`NVIDIA API returned non-JSON HTTP ${response.status}: ${raw.slice(0, 500)}`);
  }

  if (!response.ok) {
    const apiError = payload.error?.message ?? raw.slice(0, 500);
    throw new Error(`NVIDIA API HTTP ${response.status}: ${apiError}`);
  }

  const content = payload.choices?.[0]?.message?.content ?? "";
  if (!content) {
    throw new Error("NVIDIA API returned an empty answer");
  }

  return {
    content,
    model: payload.model ?? env.NVIDIA_MODEL,
    usage: payload.usage ?? null,
  };
}

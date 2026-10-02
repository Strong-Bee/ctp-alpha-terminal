import { env } from "../config/env.js";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type NvidiaChatOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

const BASE_URL = env.NVIDIA_BASE_URL.replace(/\/$/, "");

export async function nvidiaChat(options: NvidiaChatOptions) {
  if (!env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  const body: Record<string, unknown> = {
    model: env.NVIDIA_MODEL,
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 1200,
  };

  if (env.NVIDIA_ENABLE_THINKING) {
    body.extra_body = {
      chat_template_kwargs: {
        enable_thinking: true,
      },
    };
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
    usage?: Record<string, unknown>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `NVIDIA API returned HTTP ${response.status}`);
  }

  return {
    content: payload.choices?.[0]?.message?.content ?? "",
    model: payload.model ?? env.NVIDIA_MODEL,
    usage: payload.usage ?? null,
  };
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchSearXNG } from "./searxng";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchResult = {
  title?: string;
  url?: string;
  description?: string;
  content?: string;
  publishedDate?: string;
  engine?: string | string[];
  instance: string;
};

const buildQueries = (message: string) => [
  message,
  message + " latest developments evidence data",
  message + " risks counterarguments technical analysis",
];

async function askNvidia(
  message: string,
  model: string,
  context: string,
  apiKey: string,
) {
  const baseUrl = (
    process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1"
  ).replace(/\/$/, "");
  const temperature = Number.isFinite(Number(process.env.NVIDIA_TEMPERATURE))
    ? Number(process.env.NVIDIA_TEMPERATURE)
    : 0.1;
  const maxTokens = Number.isInteger(Number(process.env.NVIDIA_MAX_TOKENS))
    ? Number(process.env.NVIDIA_MAX_TOKENS)
    : 4096;
  const reasoningEffort = ["none", "medium", "high"].includes(
    process.env.NVIDIA_REASONING_EFFORT || "",
  )
    ? process.env.NVIDIA_REASONING_EFFORT
    : "medium";

  const requestBody: Record<string, unknown> = {
    model,
    messages: [
      {
        role: "system",
        content: `You are CTP Alpha Deep Research AI. Perform evidence-driven synthesis from the supplied web research.
Rules:
- Cite sources inline as [1], [2], etc. matching the source list.
- Separate VERIFIED FACTS, ANALYSIS/INFERENCE, CONTRADICTORY EVIDENCE, RISKS, and UNKNOWN/DATA GAPS.
- Prefer recent primary sources and direct evidence over commentary.
- Do not invent facts or sources.
- For crypto/market questions, examine catalyst, narrative, liquidity, on-chain implications, market structure, bull/bear cases, invalidation, and risk.
- If sources disagree, explicitly explain the disagreement.
- End with a concise research conclusion and the most important sources to verify manually.
`,
      },
      {
        role: "user",
        content: `QUESTION:
${message}

WEB RESEARCH:
${context}`,
      },
    ],
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };

  if (reasoningEffort !== "none") {
    requestBody.reasoning_effort = reasoningEffort;
  }
  if (process.env.NVIDIA_ENABLE_THINKING !== "false") {
    requestBody.chat_template_kwargs = { enable_thinking: true };
  }

  const response = await fetch(baseUrl + "/chat/completions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(
      Number(process.env.NVIDIA_TIMEOUT_MS) || 120000,
    ),
  });

  const raw = await response.text();
  let data: {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: unknown;
    model?: string;
    error?: { message?: string };
  } = {};

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("NVIDIA returned invalid JSON");
  }

  if (!response.ok) {
    throw new Error(data.error?.message || raw.slice(0, 500));
  }

  const answer = data.choices?.[0]?.message?.content || "";
  if (!answer) throw new Error("NVIDIA returned an empty answer");

  return {
    answer,
    usage: data.usage || null,
    model: data.model || model,
  };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  const model = String(
    body.model ||
      process.env.NVIDIA_MODEL ||
      "nvidia/nemotron-3-ultra-550b-a55b",
  ).trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (!nvidiaKey) {
    return NextResponse.json(
      { error: "NVIDIA_API_KEY belum diatur di .env.local/.env" },
      { status: 400 },
    );
  }

  try {
    const pages = Math.min(
      Math.max(Number(process.env.SEARXNG_PAGES || 1), 1),
      3,
    );
    const maxResults = Math.min(
      Math.max(Number(process.env.SEARXNG_MAX_RESULTS || 12), 1),
      30,
    );

    const queryAttempts = await Promise.allSettled(
      buildQueries(message).flatMap((query) =>
        Array.from({ length: pages }, (_, index) =>
          searchSearXNG(query, index + 1),
        ),
      ),
    );

    const queryResults = queryAttempts
      .filter(
        (attempt): attempt is PromiseFulfilledResult<Awaited<ReturnType<typeof searchSearXNG>>> =>
          attempt.status === "fulfilled",
      )
      .map((attempt) => attempt.value);

    const failedSearches = queryAttempts
      .filter((attempt): attempt is PromiseRejectedResult => attempt.status === "rejected")
      .map((attempt) => (attempt.reason instanceof Error ? attempt.reason.message : String(attempt.reason)))
      .slice(0, 5);

    const results: SearchResult[] = queryResults
      .flatMap((response) => response.results)
      .filter((item) => item.url)
      .filter(
        (item, index, arr) =>
          arr.findIndex((candidate) => candidate.url === item.url) === index,
      )
      .slice(0, maxResults);

    if (!results.length) {
      return NextResponse.json(
        {
          error: "Deep Search tidak menemukan sumber JSON yang tersedia dari public SearXNG instances",
          failedSearches,
        },
        { status: 502 },
      );
    }

    const context = results
      .map((item, index) => {
        const content = String(
          item.content || item.description || "",
        ).slice(0, 7000);

        return `SOURCE [${index + 1}]
TITLE: ${item.title || "Untitled"}
URL: ${item.url}
SEARXNG INSTANCE: ${item.instance}
CONTENT:
${content}`;
      })
      .join("\n\n---\n\n");

    const ai = await askNvidia(message, model, context, nvidiaKey);

    return NextResponse.json({
      provider: "nvidia",
      model: ai.model,
      answer: ai.answer,
      usage: ai.usage,
      deepSearch: true,
      sourceCount: results.length,
      instancesUsed: [...new Set(results.map((item) => item.instance))],
      failedSearches,
      sources: results.map((item, index) => ({
        id: index + 1,
        title: item.title || item.url,
        url: item.url,
        instance: item.instance,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Deep Search failed",
      },
      { status: 502 },
    );
  }
}

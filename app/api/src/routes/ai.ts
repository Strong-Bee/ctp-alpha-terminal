import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { getCryptoIntel, newsToAiContext } from "../services/crypto-intel.js";
import { nvidiaChat } from "../services/nvidia.js";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1).max(12000),
  context: z.string().max(20000).optional(),
  includeLiveNews: z.boolean().default(true),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().int().min(64).max(32768).optional(),
  reasoningEffort: z.enum(["none", "medium", "high"]).optional(),
});

const alphaSchema = z.object({
  asset: z.string().min(1).max(100),
  market: z.string().max(12000).optional(),
  onchain: z.string().max(12000).optional(),
  walletIntel: z.string().max(12000).optional(),
  narrative: z.string().max(12000).optional(),
  risk: z.string().max(12000).optional(),
  includeLiveNews: z.boolean().default(true),
});

const ALPHA_SYSTEM_PROMPT = `You are CTP Alpha AI, the analytical assistant inside CTP Alpha Terminal.

You are a crypto market-intelligence system, not a hype generator. Use current terminal data when supplied and never invent missing facts. Separate:
- OBSERVED: directly supplied market/on-chain/news data
- INFERENCE: reasoned interpretation
- UNKNOWN: data that is missing or stale

For live news, treat headlines as unverified until corroborated. Prefer multiple independent sources, flag conflicting reports, and include timestamps/source names. Do not turn a headline into a trade signal without market/on-chain confirmation.

When analyzing an asset, structure the response as:
1. Market regime
2. Current news / narrative
3. On-chain evidence
4. Smart-money / wallet evidence
5. Liquidity / manipulation risks
6. Bull case
7. Bear case
8. Invalidation
9. Risk notes
10. Data gaps

For normal chat, answer directly but preserve the same evidence discipline. Never claim you browsed a page you did not receive. Never present a guaranteed outcome.`;

async function liveNewsContext(enabled: boolean) {
  if (!enabled) return "";
  try {
    const intel = await getCryptoIntel();
    return newsToAiContext(intel.news, 15);
  } catch {
    return "";
  }
}

router.get("/health", (_req, res) => {
  res.json({
    provider: "nvidia",
    configured: Boolean(env.NVIDIA_API_KEY),
    baseUrl: env.NVIDIA_BASE_URL,
    model: env.NVIDIA_MODEL,
    timeoutMs: env.NVIDIA_TIMEOUT_MS,
    liveNews: true,
  });
});

router.post("/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const newsContext = await liveNewsContext(parsed.data.includeLiveNews);
    const terminalContext = [
      parsed.data.context ? `Terminal context:\n${parsed.data.context}` : "",
      newsContext ? `LIVE CRYPTO NEWS SNAPSHOT:\n${newsContext}` : "",
    ].filter(Boolean).join("\n\n");

    const messages = [
      { role: "system" as const, content: ALPHA_SYSTEM_PROMPT },
      ...(terminalContext ? [{ role: "system" as const, content: terminalContext }] : []),
      { role: "user" as const, content: parsed.data.message },
    ];

    const result = await nvidiaChat({
      messages,
      temperature: parsed.data.temperature ?? 0.15,
      maxTokens: parsed.data.maxTokens ?? 4096,
      reasoningEffort: parsed.data.reasoningEffort ?? "medium",
    });

    return res.json({
      provider: "nvidia",
      model: result.model,
      answer: result.content,
      usage: result.usage,
      liveNews: Boolean(newsContext),
    });
  } catch (error) {
    return res.status(502).json({
      error: "NVIDIA AI request failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/alpha-analysis", async (req, res) => {
  const parsed = alphaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const newsContext = await liveNewsContext(data.includeLiveNews);
  const context = [
    `Asset: ${data.asset}`,
    data.market && `Market:\n${data.market}`,
    data.onchain && `On-chain:\n${data.onchain}`,
    data.walletIntel && `Wallet intelligence:\n${data.walletIntel}`,
    data.narrative && `Narrative/catalyst:\n${data.narrative}`,
    data.risk && `Risk:\n${data.risk}`,
    newsContext && `LIVE CRYPTO NEWS:\n${newsContext}`,
  ].filter(Boolean).join("\n\n");

  try {
    const result = await nvidiaChat({
      messages: [
        { role: "system", content: ALPHA_SYSTEM_PROMPT },
        { role: "user", content: `Analyze this CTP Alpha Terminal dataset.\n\n${context}` },
      ],
      temperature: 0.1,
      maxTokens: 4096,
      reasoningEffort: "medium",
    });

    return res.json({
      provider: "nvidia",
      model: result.model,
      asset: data.asset,
      analysis: result.content,
      usage: result.usage,
      liveNews: Boolean(newsContext),
    });
  } catch (error) {
    return res.status(502).json({
      error: "NVIDIA AI analysis failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as aiRouter };

import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { nvidiaChat } from "../services/nvidia.js";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1).max(12000),
  context: z.string().max(20000).optional(),
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
});

const ALPHA_SYSTEM_PROMPT = `You are CTP Alpha AI, the analytical assistant inside CTP Alpha Terminal.

Your job is to interpret structured crypto market, on-chain, wallet, narrative, liquidity, macro and risk data. Do not invent missing data. Clearly separate observed data from inference. Never present an AI opinion as a guaranteed trade outcome.

When analyzing an asset, structure the response as:
1. Market regime
2. Narrative/catalyst
3. On-chain evidence
4. Smart-money/wallet evidence
5. Liquidity and manipulation risks
6. Bull case
7. Bear case
8. Invalidations
9. Risk notes
10. Data gaps

Use concise trading terminology. Prefer evidence and explicit uncertainty over hype.`;

router.get("/health", (_req, res) => {
  res.json({
    provider: "nvidia",
    configured: Boolean(env.NVIDIA_API_KEY),
    baseUrl: env.NVIDIA_BASE_URL,
    model: env.NVIDIA_MODEL,
    timeoutMs: env.NVIDIA_TIMEOUT_MS,
  });
});

router.post("/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const result = await nvidiaChat({
      messages: [
        { role: "system", content: ALPHA_SYSTEM_PROMPT },
        ...(parsed.data.context
          ? [{ role: "system" as const, content: `Terminal context:\n${parsed.data.context}` }]
          : []),
        { role: "user", content: parsed.data.message },
      ],
      temperature: parsed.data.temperature ?? 0.2,
      maxTokens: parsed.data.maxTokens ?? 4096,
      reasoningEffort: parsed.data.reasoningEffort ?? "medium",
    });

    return res.json({
      provider: "nvidia",
      model: result.model,
      answer: result.content,
      usage: result.usage,
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
  const context = [
    `Asset: ${data.asset}`,
    data.market && `Market:\n${data.market}`,
    data.onchain && `On-chain:\n${data.onchain}`,
    data.walletIntel && `Wallet intelligence:\n${data.walletIntel}`,
    data.narrative && `Narrative/catalyst:\n${data.narrative}`,
    data.risk && `Risk:\n${data.risk}`,
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
    });
  } catch (error) {
    return res.status(502).json({
      error: "NVIDIA AI analysis failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as aiRouter };

import { Router } from "express";
import { z } from "zod";
import { dex } from "../services/dexscreener.js";

const router = Router();
const pathSchema = z.string().min(1).max(300);

async function run(res: any, fn: () => Promise<unknown>) {
  try {
    return res.json(await fn());
  } catch (error) {
    return res.status(502).json({
      error: "DEX Screener request failed",
      message: error instanceof Error ? error.message : "Unknown error",
      degraded: true,
    });
  }
}

function safeParam(value: unknown, label: string) {
  const parsed = pathSchema.safeParse(value);
  if (!parsed.success) {
    return { error: { status: 400, body: { error: `Invalid ${label}` } } };
  }
  return { value: parsed.data };
}

router.get("/token-profiles/latest", (_req, res) => run(res, dex.tokenProfilesLatest));
router.get("/token-profiles/recent", (_req, res) => run(res, dex.tokenProfilesRecent));
router.get("/community-takeovers/latest", (_req, res) => run(res, dex.communityTakeovers));
router.get("/ads/latest", (_req, res) => run(res, dex.adsLatest));
router.get("/token-boosts/latest", (_req, res) => run(res, dex.tokenBoostsLatest));
router.get("/token-boosts/top", (_req, res) => run(res, dex.tokenBoostsTop));
router.get("/metas/trending", (_req, res) => run(res, dex.metasTrending));

router.get("/search", (req, res) => {
  const parsed = z.string().min(1).max(200).safeParse(req.query.q);
  if (!parsed.success) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }
  return run(res, () => dex.search(parsed.data));
});

router.get("/meta/:slug", (req, res) => {
  const parsed = safeParam(req.params.slug, "slug");
  if ("error" in parsed) return res.status(parsed.error.status).json(parsed.error.body);
  return run(res, () => dex.meta(parsed.value));
});

router.get("/pair/:chainId/:pairId", (req, res) => {
  const chain = safeParam(req.params.chainId, "chainId");
  const pair = safeParam(req.params.pairId, "pairId");
  if ("error" in chain) return res.status(chain.error.status).json(chain.error.body);
  if ("error" in pair) return res.status(pair.error.status).json(pair.error.body);
  return run(res, () => dex.pair(chain.value, pair.value));
});

router.get("/orders/:chainId/:tokenAddress", (req, res) => {
  const chain = safeParam(req.params.chainId, "chainId");
  const token = safeParam(req.params.tokenAddress, "tokenAddress");
  if ("error" in chain) return res.status(chain.error.status).json(chain.error.body);
  if ("error" in token) return res.status(token.error.status).json(token.error.body);
  return run(res, () => dex.orders(chain.value, token.value));
});

router.get("/token-pairs/:chainId/:tokenAddress", (req, res) => {
  const chain = safeParam(req.params.chainId, "chainId");
  const token = safeParam(req.params.tokenAddress, "tokenAddress");
  if ("error" in chain) return res.status(chain.error.status).json(chain.error.body);
  if ("error" in token) return res.status(token.error.status).json(token.error.body);
  return run(res, () => dex.tokenPairs(chain.value, token.value));
});

router.get("/tokens/:chainId/:tokenAddresses", (req, res) => {
  const chain = safeParam(req.params.chainId, "chainId");
  const tokens = safeParam(req.params.tokenAddresses, "tokenAddresses");
  if ("error" in chain) return res.status(chain.error.status).json(chain.error.body);
  if ("error" in tokens) return res.status(tokens.error.status).json(tokens.error.body);
  return run(res, () => dex.tokens(chain.value, tokens.value));
});

export { router as dexRouter };

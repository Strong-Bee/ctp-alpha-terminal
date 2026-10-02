import { Router } from "express";
import { z } from "zod";
import { dex } from "../services/dexscreener.js";

const router = Router();
const pathSchema = z.string().min(1).max(300);

async function run(res: any, fn: () => Promise<unknown>) {
  try { res.json(await fn()); }
  catch (error) {
    res.status(502).json({ error: "DEX Screener request failed", message: error instanceof Error ? error.message : "Unknown error" });
  }
}

router.get("/token-profiles/latest", (_req, res) => run(res, dex.tokenProfilesLatest));
router.get("/token-profiles/recent", (_req, res) => run(res, dex.tokenProfilesRecent));
router.get("/community-takeovers/latest", (_req, res) => run(res, dex.communityTakeovers));
router.get("/ads/latest", (_req, res) => run(res, dex.adsLatest));
router.get("/token-boosts/latest", (_req, res) => run(res, dex.tokenBoostsLatest));
router.get("/token-boosts/top", (_req, res) => run(res, dex.tokenBoostsTop));
router.get("/metas/trending", (_req, res) => run(res, dex.metasTrending));

router.get("/search", (req, res) => {
  const q = z.string().min(1).max(200).parse(req.query.q);
  return run(res, () => dex.search(q));
});
router.get("/meta/:slug", (req, res) => run(res, () => dex.meta(pathSchema.parse(req.params.slug))));
router.get("/pair/:chainId/:pairId", (req, res) => run(res, () => dex.pair(pathSchema.parse(req.params.chainId), pathSchema.parse(req.params.pairId))));
router.get("/orders/:chainId/:tokenAddress", (req, res) => run(res, () => dex.orders(pathSchema.parse(req.params.chainId), pathSchema.parse(req.params.tokenAddress))));
router.get("/token-pairs/:chainId/:tokenAddress", (req, res) => run(res, () => dex.tokenPairs(pathSchema.parse(req.params.chainId), pathSchema.parse(req.params.tokenAddress))));
router.get("/tokens/:chainId/:tokenAddresses", (req, res) => run(res, () => dex.tokens(pathSchema.parse(req.params.chainId), pathSchema.parse(req.params.tokenAddresses))));

export { router as dexRouter };

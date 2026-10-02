import { Router } from "express";
import { getCryptoIntel } from "../services/crypto-intel.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const force = req.query.refresh === "1";
    const data = await getCryptoIntel(force);
    res.json({
      generatedAt: new Date(data.at).toISOString(),
      refreshMs: 30000,
      count: data.news.length,
      news: data.news,
      markets: data.markets,
      sources: [...new Set(data.news.map((item) => item.source))],
      degraded: false,
    });
  } catch (error) {
    // The dashboard should remain usable when every public feed is temporarily unavailable.
    res.status(200).json({
      generatedAt: new Date().toISOString(),
      refreshMs: 30000,
      count: 0,
      news: [],
      markets: [],
      sources: [],
      degraded: true,
      error: error instanceof Error ? error.message : "Crypto intelligence fetch failed",
    });
  }
});

router.post("/refresh", async (_req, res) => {
  try {
    const data = await getCryptoIntel(true);
    res.json({ ok: true, generatedAt: new Date(data.at).toISOString(), count: data.news.length, degraded: false });
  } catch (error) {
    res.status(200).json({
      ok: false,
      generatedAt: new Date().toISOString(),
      count: 0,
      degraded: true,
      error: error instanceof Error ? error.message : "Crypto intelligence refresh failed",
    });
  }
});

export { router as newsRouter };

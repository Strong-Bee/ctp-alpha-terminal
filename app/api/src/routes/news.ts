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
    });
  } catch (error) {
    res.status(502).json({
      error: "Crypto intelligence fetch failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/refresh", async (_req, res) => {
  try {
    const data = await getCryptoIntel(true);
    res.json({ ok: true, generatedAt: new Date(data.at).toISOString(), count: data.news.length });
  } catch (error) {
    res.status(502).json({
      error: "Crypto intelligence refresh failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as newsRouter };

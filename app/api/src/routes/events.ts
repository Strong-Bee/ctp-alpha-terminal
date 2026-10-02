import { Router } from "express";
import { fetchCoinCarpEvents } from "../services/coincarp-events.js";

const router = Router();

router.get("/coincarp", async (req, res) => {
  try {
    const requested = Number(req.query.limit);
    const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 10), 100) : 100;
    const events = await fetchCoinCarpEvents(limit);
    res.json({ source: "coincarp", sourceUrl: "https://www.coincarp.com/events/", generatedAt: new Date().toISOString(), count: events.length, events });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "CoinCarp events fetch failed" });
  }
});

export { router as eventsRouter };

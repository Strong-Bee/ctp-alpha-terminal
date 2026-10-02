import { Router } from "express";

export const macroRouter = Router();

macroRouter.get("/status", (_req, res) => {
  res.json({
    providers: { fred: Boolean(process.env.FRED_API_KEY), bls: Boolean(process.env.BLS_API_KEY), official: true },
    note: "Economic releases are provider-driven. No fabricated calendar events are returned."
  });
});

macroRouter.get("/fred/series/:seriesId", async (req, res) => {
  const key = process.env.FRED_API_KEY;
  if (!key) return res.status(503).json({ error: "FRED_API_KEY is not configured" });
  const params = new URLSearchParams({
    series_id: req.params.seriesId, api_key: key, file_type: "json", sort_order: "desc", limit: "100"
  });
  const response = await fetch("https://api.stlouisfed.org/fred/series/observations?" + params);
  if (!response.ok) return res.status(response.status).json({ error: "FRED request failed" });
  res.json(await response.json());
});

import { Router } from "express";

export const macroRouter = Router();

macroRouter.get("/status", (_req, res) => {
  res.json({
    providers: {
      fred: Boolean(process.env.FRED_API_KEY),
      bls: Boolean(process.env.BLS_API_KEY),
      official: true,
    },
    note: "Economic releases are provider-driven. No fabricated calendar events are returned.",
  });
});

macroRouter.get("/fred/series/:seriesId", async (req, res) => {
  const key = process.env.FRED_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "FRED_API_KEY is not configured",
      degraded: true,
    });
  }

  try {
    const seriesId = String(req.params.seriesId || "").trim();
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(seriesId)) {
      return res.status(400).json({ error: "Invalid FRED series id" });
    }

    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: key,
      file_type: "json",
      sort_order: "desc",
      limit: "100",
    });

    const response = await fetch(
      "https://api.stlouisfed.org/fred/series/observations?" + params,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      },
    );

    const body = await response.text();
    if (!response.ok) {
      return res.status(502).json({
        error: "FRED request failed",
        upstreamStatus: response.status,
        degraded: true,
      });
    }

    try {
      return res.json(JSON.parse(body));
    } catch {
      return res.status(502).json({
        error: "FRED returned invalid JSON",
        degraded: true,
      });
    }
  } catch (error) {
    return res.status(502).json({
      error: "FRED request failed",
      message: error instanceof Error ? error.message : "Unknown upstream error",
      degraded: true,
    });
  }
});

import { Router } from "express";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", (_req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    modules: {
      narrative: "ready", launches: "planned", onchain: "planned", wallets: "planned",
      defi: "planned", risk: "ready", orderFlow: "planned", macro: "planned", cycles: "planned",
    },
    alpha: { score: 0, confidence: 0, regime: "NEUTRAL" },
  });
});
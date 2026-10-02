import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { aiRouter } from "./routes/ai.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { dexRouter } from "./routes/dex.js";
import { healthRouter } from "./routes/health.js";
import { newsRouter } from "./routes/news.js";
import { realtimeRouter } from "./routes/realtime.js";
import { macroRouter } from "./routes/macro.js";
import { onchainRouter } from "./routes/onchain.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());

const allowedOrigins = env.CORS_ORIGIN.split(",").map((v) => v.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(origin) ||
      (env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp());
app.get("/", (_req, res) => res.json({ name: "CTP Alpha Terminal API", version: "v1", status: "online" }));
app.use("/health", healthRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/dex", dexRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/realtime", realtimeRouter);
app.use("/api/v1/macro", macroRouter);
app.use("/api/v1/onchain", onchainRouter);
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

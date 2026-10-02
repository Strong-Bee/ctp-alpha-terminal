import { Router } from "express";
import { subscribeRealtime } from "../services/realtime.js";

export const realtimeRouter = Router();

realtimeRouter.get("/snapshot", (_req, res) => {
  res.json({
    status: "ok",
    stream: "/api/v1/realtime/events",
    transport: "SSE",
    timestamp: new Date().toISOString(),
  });
});

realtimeRouter.get("/events", async (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  // Send an immediate event so the browser can confirm the stream is alive.
  res.write("data: " + JSON.stringify({
    type: "connected",
    source: "api",
    timestamp: new Date().toISOString(),
    data: { redis: "optional" },
  }) + "\n\n");

  const cleanup = await subscribeRealtime((event) => {
    if (res.writableEnded) return;
    res.write("event: " + event.type + "\n");
    res.write("data: " + JSON.stringify(event) + "\n\n");
  });

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(": heartbeat\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    void cleanup();
  });
});

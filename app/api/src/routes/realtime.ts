import { Router } from "express";
import { subscribeRealtime } from "../services/realtime.js";

export const realtimeRouter = Router();

realtimeRouter.get("/snapshot", (_req, res) => {
  res.json({ status: "ok", stream: "/api/v1/realtime/events", transport: "SSE", timestamp: new Date().toISOString() });
});

realtimeRouter.get("/events", async (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  const cleanup = await subscribeRealtime((event) => {
    res.write("event: " + event.type + "\\ndata: " + JSON.stringify(event) + "\\n\\n");
  });
  const heartbeat = setInterval(() => res.write(": heartbeat\\n\\n"), 15000);
  req.on("close", () => { clearInterval(heartbeat); void cleanup(); });
});

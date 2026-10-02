import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});
const queue = new Queue("ctp-alpha", { connection });

new Worker(
  "ctp-alpha",
  async (job) => {
    if (job.name === "crypto-intel-refresh") {
      const apiUrl = process.env.CTP_API_URL ?? "http://localhost:4000";
      try {
        const response = await fetch(`${apiUrl}/api/v1/news/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = (await response.json()) as { count?: number };
        console.log(`[worker] crypto intelligence refreshed: ${result.count ?? 0} items`);
        return { ok: true, ...result, processedAt: new Date().toISOString() };
      } catch (error) {
        console.error("[worker] crypto intelligence refresh failed:", error);
        throw error;
      }
    }

    console.log(`[worker] processing ${job.name}`, job.data);
    return { ok: true, processedAt: new Date().toISOString() };
  },
  { connection, concurrency: 1 },
);

await queue.add(
  "crypto-intel-refresh",
  { source: "ctp-alpha-worker" },
  {
    repeat: { every: 30_000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
);

await queue.add("heartbeat", { source: "ctp-alpha-worker" }, { removeOnComplete: 100 });
console.log("CTP Alpha Worker online — crypto intelligence refresh every 30s");

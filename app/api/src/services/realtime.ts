import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });
const channel = "ctp-alpha:events";

export type RealtimeEvent = {
  type: string;
  source: string;
  timestamp: string;
  data: unknown;
};

export async function publishRealtime(event: RealtimeEvent) {
  await redis.publish(channel, JSON.stringify(event));
}

export async function subscribeRealtime(onEvent: (event: RealtimeEvent) => void) {
  const subscriber = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });
  await subscriber.subscribe(channel);
  subscriber.on("message", (_channel, message) => {
    try { onEvent(JSON.parse(message) as RealtimeEvent); } catch {}
  });
  return async () => { await subscriber.unsubscribe(channel); await subscriber.quit(); };
}

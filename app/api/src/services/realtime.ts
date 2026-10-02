import IORedis from "ioredis";

const channel = "ctp-alpha:events";
const localSubscribers = new Set<(event: RealtimeEvent) => void>();
let redis: IORedis | null = null;

export type RealtimeEvent = {
  type: string;
  source: string;
  timestamp: string;
  data: unknown;
};

function getRedis() {
  if (redis) return redis;
  const client = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
  });
  client.on("error", () => {});
  redis = client;
  return client;
}

export async function publishRealtime(event: RealtimeEvent) {
  for (const subscriber of localSubscribers) {
    try { subscriber(event); } catch {}
  }

  try {
    const client = getRedis();
    if (client.status === "wait") await client.connect();
    if (client.status === "ready") await client.publish(channel, JSON.stringify(event));
  } catch {
    // Realtime remains available through the local process when Redis is unavailable.
  }
}

export async function subscribeRealtime(onEvent: (event: RealtimeEvent) => void) {
  localSubscribers.add(onEvent);

  let subscriber: IORedis | null = null;
  try {
    subscriber = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    subscriber.on("error", () => {});
    await subscriber.connect();
    await subscriber.subscribe(channel);
    subscriber.on("message", (_channel, message) => {
      try { onEvent(JSON.parse(message) as RealtimeEvent); } catch {}
    });
  } catch {
    await subscriber?.quit().catch(() => {});
    subscriber = null;
  }

  return async () => {
    localSubscribers.delete(onEvent);
    if (subscriber) {
      await subscriber.unsubscribe(channel).catch(() => {});
      await subscriber.quit().catch(() => {});
    }
  };
}

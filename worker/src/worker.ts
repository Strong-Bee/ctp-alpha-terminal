import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import WebSocket from "ws";

const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });
const connection = redis;
const queue = new Queue("ctp-alpha", { connection });

const symbols = (process.env.BINANCE_SYMBOLS ?? "btcusdt,ethusdt,solusdt,bnbusdt,xrpusdt").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
const streams = symbols.flatMap(symbol => [symbol + "@aggTrade", symbol + "@bookTicker"]);
const binanceUrl = "wss://stream.binance.com:9443/stream?streams=" + streams.join("/");
const newsFeeds = (process.env.NEWS_RSS_URLS ?? "").split(",").map(s => s.trim()).filter(Boolean);

async function publish(type: string, source: string, data: unknown) {
  await redis.publish("ctp-alpha:events", JSON.stringify({ type, source, timestamp: new Date().toISOString(), data }));
}

function startBinance() {
  let ws: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | undefined;

  const connect = () => {
    ws = new WebSocket(binanceUrl);
    ws.on("open", () => console.log("[worker] Binance market stream connected:", symbols.join(", ")));
    ws.on("message", async raw => {
      try {
        const envelope = JSON.parse(raw.toString()) as { stream?: string; data?: Record<string, unknown> };
        const data = envelope.data;
        if (!data) return;
        const event = data.e as string;
        if (event === "aggTrade") await publish("market.trade", "binance", {
          symbol: data.s, price: Number(data.p), quantity: Number(data.q), tradeId: data.a, maker: Boolean(data.m), eventTime: data.E
        });
        if (event === "bookTicker") await publish("market.book", "binance", {
          symbol: data.s, bid: Number(data.b), bidQty: Number(data.B), ask: Number(data.a), askQty: Number(data.A), updateId: data.u
        });
      } catch (error) { console.error("[worker] Binance event error:", error); }
    });
    ws.on("error", error => console.error("[worker] Binance WS error:", error.message));
    ws.on("close", () => {
      console.warn("[worker] Binance stream disconnected; reconnecting");
      if (!reconnectTimer) reconnectTimer = setTimeout(() => { reconnectTimer = undefined; connect(); }, 2000);
    });
  };
  connect();
}

async function refreshRss() {
  for (const url of newsFeeds) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "CTP-Alpha-Terminal/1.0", accept: "application/rss+xml,application/atom+xml,text/xml" } });
      if (!response.ok) continue;
      const xml = await response.text();
      const items = [...xml.matchAll(/<(item|entry)[^>]*>([\s\S]*?)<\/\1>/gi)].map(match => match[2]);
      for (const item of items.slice(0, 30)) {
        const pick = (tag: string) => {
          const match = item.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i"));
          return match ? match[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, "").replace(/<[^>]+>/g, "").trim() : "";
        };
        const title = pick("title");
        const link = pick("link");
        const publishedAt = pick("pubDate") || pick("published") || pick("updated");
        if (title) await publish("news.item", "rss", { title, url: link, publishedAt, source: url });
      }
    } catch (error) { console.error("[worker] RSS error:", error); }
  }
}

new Worker("ctp-alpha", async job => {
  if (job.name === "crypto-intel-refresh") {
    const apiUrl = process.env.CTP_API_URL ?? "http://localhost:4000";
    const response = await fetch(apiUrl + "/api/v1/news/refresh", { method: "POST", headers: { "Content-Type": "application/json" } });
    if (!response.ok) throw new Error("News refresh HTTP " + response.status);
    return await response.json();
  }
  if (job.name === "rss-refresh") { await refreshRss(); return { ok: true }; }
  return { ok: true, processedAt: new Date().toISOString() };
}, { connection, concurrency: 1 });

await queue.add("crypto-intel-refresh", { source: "ctp-alpha-worker" }, {
  repeat: { every: 30000 }, removeOnComplete: 100, removeOnFail: 100
});
await queue.add("rss-refresh", { source: "ctp-alpha-worker" }, {
  repeat: { every: 15000 }, removeOnComplete: 100, removeOnFail: 100
});
await queue.add("heartbeat", { source: "ctp-alpha-worker" }, { removeOnComplete: 100 });

startBinance();
console.log("[worker] CTP realtime ingestion online");
console.log("[worker] Binance streams:", binanceUrl);
console.log("[worker] RSS feeds:", newsFeeds.length);

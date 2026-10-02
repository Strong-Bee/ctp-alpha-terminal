import { env } from "../config/env.js";

export type CryptoEvent = {
  source: "coincarp";
  title: string;
  url: string;
  project?: string;
  symbol?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  scrapedAt: string;
};

const SOURCE_URL = "https://www.coincarp.com/events/";

function clean(value: string): string {
  return value.replace(/\\s+/g, " ").replace(/\\u00a0/g, " ").trim();
}

function absoluteUrl(value: string): string {
  try { return new URL(value, SOURCE_URL).toString(); } catch { return SOURCE_URL; }
}

function stripHtml(value: string): string {
  return clean(value.replace(/<script[\\s\\S]*?<\\/script>/gi, "").replace(/<style[\\s\\S]*?<\\/style>/gi, "").replace(/<[^>]+>/g, " "));
}

export async function fetchCoinCarpEvents(limit = env.NEWS_LIMIT): Promise<CryptoEvent[]> {
  const response = await fetch(SOURCE_URL, {
    headers: { accept: "text/html,application/xhtml+xml", "user-agent": "CTP-Alpha-Terminal/1.0 (+https://cybertechnologyproject.my.id)" },
    cache: "no-store",
    signal: AbortSignal.timeout(env.ONCHAIN_RPC_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`CoinCarp Events HTTP ${response.status}`);
  const html = await response.text();

  const events: CryptoEvent[] = [];
  const seen = new Set<string>();
  const linkRe = /<a\\b[^>]*href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(html)) && events.length < limit) {
    const href = absoluteUrl(match[1]);
    const title = stripHtml(match[2]);
    if (!title || title.length < 3 || !/coincarp\\.com/i.test(href)) continue;
    if (href === SOURCE_URL || seen.has(href)) continue;
    if (!/event|events/i.test(href)) continue;
    seen.add(href);
    events.push({ source: "coincarp", title, url: href, scrapedAt: new Date().toISOString() });
  }
  return events;
}

export { SOURCE_URL as COINCARP_EVENTS_URL };

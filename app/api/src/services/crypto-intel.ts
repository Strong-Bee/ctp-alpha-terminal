import { env } from "../config/env.js";

export type CryptoNewsItem = {
  id: string;
  source: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
  category: "news" | "market" | "defi" | "security" | "macro";
};

export type MarketItem = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
};

const FEEDS = [
  // Major crypto media
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { name: "Decrypt", url: "https://decrypt.co/feed" },
  { name: "The Block", url: "https://www.theblock.co/rss.xml" },
  { name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/feed" },
  { name: "CryptoSlate", url: "https://cryptoslate.com/feed/" },
  { name: "NewsBTC", url: "https://www.newsbtc.com/feed/" },
  { name: "Bitcoin.com", url: "https://news.bitcoin.com/feed/" },
  { name: "U.Today", url: "https://u.today/rss" },
  { name: "CryptoPotato", url: "https://cryptopotato.com/feed/" },
  { name: "BeInCrypto", url: "https://beincrypto.com/feed/" },
  { name: "AMBCrypto", url: "https://ambcrypto.com/feed/" },
  { name: "CryptoNews", url: "https://cryptonews.com/news/feed/" },
  { name: "Blockworks", url: "https://blockworks.co/feed" },
  { name: "The Daily Hodl", url: "https://dailyhodl.com/feed/" },
  // Topic discovery through Google News RSS. These broaden coverage beyond fixed publishers.
  { name: "Google News Crypto", url: "https://news.google.com/rss/search?q=(bitcoin%20OR%20ethereum%20OR%20solana%20OR%20crypto%20OR%20defi)&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Bitcoin", url: "https://news.google.com/rss/search?q=bitcoin&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Ethereum", url: "https://news.google.com/rss/search?q=ethereum&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Solana", url: "https://news.google.com/rss/search?q=solana%20crypto&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News DeFi", url: "https://news.google.com/rss/search?q=DeFi%20crypto&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News ETF", url: "https://news.google.com/rss/search?q=crypto%20ETF%20bitcoin%20ethereum&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Regulation", url: "https://news.google.com/rss/search?q=crypto%20regulation%20SEC%20CFTC&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Security", url: "https://news.google.com/rss/search?q=crypto%20hack%20exploit%20security&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Macro", url: "https://news.google.com/rss/search?q=crypto%20Fed%20FOMC%20CPI%20inflation&hl=en-US&gl=US&ceid=US:en" },
];

let cache: { at: number; news: CryptoNewsItem[]; markets: MarketItem[] } = {
  at: 0,
  news: [],
  markets: [],
};

function clean(value: string) {
  const decoded = value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x60;/gi, "`");

  return decoded
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match?.[1] ? clean(match[1]) : "";
}

function parseItems(xml: string, source: string): CryptoNewsItem[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
    .map((match) => {
      const item = match[1];
      const title = tag(item, "title");
      const url = tag(item, "link") || tag(item, "guid");
      const summary = tag(item, "description");
      const published = tag(item, "pubDate") || tag(item, "published") || tag(item, "updated");
      if (!title || !url) return null;

      const lower = `${title} ${summary}`.toLowerCase();
      const category: CryptoNewsItem["category"] =
        /(hack|exploit|attack|stolen|breach|vulnerability)/.test(lower)
          ? "security"
          : /(defi|dex|yield|liquidity|lending|staking)/.test(lower)
            ? "defi"
            : /(fed|fomc|cpi|inflation|rate|treasury|macro)/.test(lower)
              ? "macro"
              : "news";

      return {
        id: `${source}:${url}`,
        source,
        title,
        url,
        summary,
        publishedAt: Number.isNaN(Date.parse(published))
          ? new Date().toISOString()
          : new Date(published).toISOString(),
        category,
      };
    })
    .filter((item): item is CryptoNewsItem => Boolean(item));
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, text/html;q=0.8",
        "User-Agent": "CTP-Alpha-Terminal/1.0 (+https://cybertechnologyproject.my.id)",
      },
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchMarkets(): Promise<MarketItem[]> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h",
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "CTP-Alpha-Terminal/1.0",
      },
    },
  );

  if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);

  const data = (await response.json()) as Array<Record<string, unknown>>;
  return data.map((coin) => ({
    id: String(coin.id),
    symbol: String(coin.symbol).toUpperCase(),
    name: String(coin.name),
    price: Number(coin.current_price ?? 0),
    change24h: Number(coin.price_change_percentage_24h ?? 0),
    marketCap: Number(coin.market_cap ?? 0),
    volume24h: Number(coin.total_volume ?? 0),
  }));
}

export async function getCryptoIntel(force = false) {
  const fresh = Date.now() - cache.at < env.NEWS_REFRESH_MS;
  if (!force && fresh && cache.news.length) return cache;

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const xml = await fetchText(feed.url);
      return parseItems(xml, feed.name);
    }),
  );

  const dedup = new Map<string, CryptoNewsItem>();
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value) dedup.set(item.url, item);
  }

  const news = [...dedup.values()]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, env.NEWS_LIMIT);

  let markets = cache.markets;
  try {
    markets = await fetchMarkets();
  } catch {
    // Keep the last market snapshot when the public market endpoint is unavailable.
  }

  cache = { at: Date.now(), news, markets };
  return cache;
}

export function newsToAiContext(items: CryptoNewsItem[], maxItems = 20) {
  return items
    .slice(0, maxItems)
    .map(
      (item, index) =>
        `[${index + 1}] ${item.source} | ${item.publishedAt} | ${item.category}\n${item.title}\n${item.summary.slice(0, 500)}\nURL: ${item.url}`,
    )
    .join("\n\n");
}

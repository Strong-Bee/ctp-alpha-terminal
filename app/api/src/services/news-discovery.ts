export type NewsSource = { name: string; url: string };
export const NEWS_DISCOVERY_SOURCES: NewsSource[] = [
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { name: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { name: "Decrypt", url: "https://decrypt.co/feed" },
  { name: "The Block", url: "https://www.theblock.co/rss.xml" },
  { name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/feed" },
  { name: "CryptoSlate", url: "https://cryptoslate.com/feed/" },
  { name: "Blockworks", url: "https://blockworks.co/feed" },
  { name: "NewsBTC", url: "https://www.newsbtc.com/feed/" },
  { name: "Bitcoin.com", url: "https://news.bitcoin.com/feed/" },
  { name: "U.Today", url: "https://u.today/rss" },
  { name: "CryptoPotato", url: "https://cryptopotato.com/feed/" },
  { name: "BeInCrypto", url: "https://beincrypto.com/feed/" },
  { name: "AMBCrypto", url: "https://ambcrypto.com/feed/" },
  { name: "CryptoNews", url: "https://cryptonews.com/news/feed/" },
  { name: "Google News Crypto", url: "https://news.google.com/rss/search?q=crypto&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Regulation", url: "https://news.google.com/rss/search?q=crypto%20regulation%20SEC%20CFTC&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Security", url: "https://news.google.com/rss/search?q=crypto%20hack%20exploit&hl=en-US&gl=US&ceid=US:en" },
  { name: "Google News Macro", url: "https://news.google.com/rss/search?q=crypto%20Fed%20CPI%20FOMC&hl=en-US&gl=US&ceid=US:en" },
];
export function getNewsDiscoverySources(extra = "") { const configured = extra.split(",").map((x) => x.trim()).filter(Boolean).map((url, i) => ({ name: `ENV News ${i + 1}`, url })); const map = new Map<string, NewsSource>(); for (const source of [...NEWS_DISCOVERY_SOURCES, ...configured]) map.set(source.url, source); return [...map.values()]; }

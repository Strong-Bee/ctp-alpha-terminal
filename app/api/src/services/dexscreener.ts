const BASE = "https://api.dexscreener.com";
const cache = new Map<string, { at: number; data: unknown }>();
const TTL = 10_000;

async function request(path: string) {
  const cached = cache.get(path);
  if (cached && Date.now() - cached.at < TTL) return cached.data;
  const response = await fetch(BASE + path, {
    headers: { Accept: "application/json", "User-Agent": "CTP-Alpha-Terminal/1.0" },
  });
  if (!response.ok) throw new Error(`DEX Screener HTTP ${response.status}`);
  const data = await response.json();
  cache.set(path, { at: Date.now(), data });
  return data;
}

export const dex = {
  tokenProfilesLatest: () => request("/token-profiles/latest/v1"),
  tokenProfilesRecent: () => request("/token-profiles/recent-updates/v1"),
  communityTakeovers: () => request("/community-takeovers/latest/v1"),
  adsLatest: () => request("/ads/latest/v1"),
  tokenBoostsLatest: () => request("/token-boosts/latest/v1"),
  tokenBoostsTop: () => request("/token-boosts/top/v1"),
  orders: (chainId: string, tokenAddress: string) => request(`/orders/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`),
  pair: (chainId: string, pairId: string) => request(`/latest/dex/pairs/${encodeURIComponent(chainId)}/${encodeURIComponent(pairId)}`),
  search: (q: string) => request(`/latest/dex/search?q=${encodeURIComponent(q)}`),
  tokenPairs: (chainId: string, tokenAddress: string) => request(`/token-pairs/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`),
  tokens: (chainId: string, tokenAddresses: string) => request(`/tokens/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddresses)}`),
  metasTrending: () => request("/metas/trending/v1"),
  meta: (slug: string) => request(`/metas/meta/v1/${encodeURIComponent(slug)}`),
};

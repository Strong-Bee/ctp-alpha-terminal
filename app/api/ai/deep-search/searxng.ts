import "server-only";

type InstanceRecord = {
  url: string;
  failures: number;
  cooldownUntil: number;
  lastUsedAt: number;
};

type DiscoveryPayload = unknown;

const DISCOVERY_URL =
  process.env.SEARXNG_DISCOVERY_URL || "https://searx.space/data/instances.json";
const DISCOVERY_TTL_MS = Math.max(
  Number(process.env.SEARXNG_DISCOVERY_TTL_MS) || 600_000,
  60_000,
);
const FAILURE_COOLDOWN_MS = Math.max(
  Number(process.env.SEARXNG_FAILURE_COOLDOWN_MS) || 60_000,
  10_000,
);
const MAX_FAILURES = Math.min(
  Math.max(Number(process.env.SEARXNG_MAX_FAILURES) || 2, 1),
  5,
);

let discoveryCache: { expiresAt: number; instances: InstanceRecord[] } | null = null;
let roundRobinIndex = 0;

const normalizeUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
};

const isLikelyInstance = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.hostname.endsWith(".onion");
  } catch {
    return false;
  }
};

function collectUrls(value: DiscoveryPayload, output: Set<string>) {
  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, output);
    return;
  }

  if (!value || typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  for (const key of ["url", "base_url", "baseUrl", "public_url", "publicUrl"]) {
    const url = normalizeUrl(record[key]);
    if (url && isLikelyInstance(url)) output.add(url);
  }

  for (const [key, child] of Object.entries(record)) {
    const keyUrl = normalizeUrl(key);
    if (keyUrl && isLikelyInstance(keyUrl)) output.add(keyUrl);
    if (child && typeof child === "object") collectUrls(child, output);
  }
}

async function discoverInstances(force = false): Promise<InstanceRecord[]> {
  if (!force && discoveryCache && discoveryCache.expiresAt > Date.now()) {
    return discoveryCache.instances;
  }

  const response = await fetch(DISCOVERY_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CTP-Alpha-Terminal/1.0 (+https://cybertechnologyproject.my.id)",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`SearX.space discovery failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as DiscoveryPayload;
  const urls = new Set<string>();
  collectUrls(payload, urls);

  const previous = new Map(
    (discoveryCache?.instances || []).map((instance) => [instance.url, instance]),
  );

  const instances = [...urls]
    .map((url) => {
      const old = previous.get(url);
      return old || { url, failures: 0, cooldownUntil: 0, lastUsedAt: 0 };
    })
    .sort((a, b) => a.lastUsedAt - b.lastUsedAt);

  if (!instances.length) {
    throw new Error("SearX.space returned no HTTPS SearXNG instances");
  }

  discoveryCache = {
    expiresAt: Date.now() + DISCOVERY_TTL_MS,
    instances,
  };

  return instances;
}

function markSuccess(instance: InstanceRecord) {
  instance.failures = 0;
  instance.cooldownUntil = 0;
  instance.lastUsedAt = Date.now();
}

function markFailure(instance: InstanceRecord) {
  instance.failures += 1;
  instance.lastUsedAt = Date.now();
  if (instance.failures >= MAX_FAILURES) {
    instance.cooldownUntil = Date.now() + FAILURE_COOLDOWN_MS;
  }
}

async function requestFromInstance(
  instance: InstanceRecord,
  query: string,
  page: number,
  timeoutMs: number,
  language: string,
  categories: string,
  safesearch: string,
  timeRange?: string,
) {
  const url = new URL(instance.url + "/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("language", language);
  url.searchParams.set("categories", categories);
  url.searchParams.set("safesearch", safesearch);
  url.searchParams.set("pageno", String(page));
  if (timeRange && ["day", "month", "year"].includes(timeRange)) {
    url.searchParams.set("time_range", timeRange);
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "CTP-Alpha-Terminal/1.0 (+https://cybertechnologyproject.my.id)",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  const raw = await response.text();
  let data: { results?: unknown[]; error?: string } = {};
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error(`${instance.url} returned invalid JSON`);
  }

  if (!response.ok) {
    throw new Error(
      data.error || `${instance.url} returned HTTP ${response.status}`,
    );
  }

  if (!Array.isArray(data.results)) {
    throw new Error(`${instance.url} returned no JSON results array`);
  }

  markSuccess(instance);

  return data.results.map((item) => {
    const result = item as Record<string, unknown>;
    return {
      title: typeof result.title === "string" ? result.title : undefined,
      url: typeof result.url === "string" ? result.url : undefined,
      description:
        typeof result.content === "string" ? result.content : undefined,
      content: typeof result.content === "string" ? result.content : undefined,
      publishedDate:
        typeof result.publishedDate === "string"
          ? result.publishedDate
          : undefined,
      engine:
        typeof result.engine === "string" || Array.isArray(result.engine)
          ? (result.engine as string | string[])
          : undefined,
      instance: instance.url,
    };
  });
}

export async function searchSearXNG(
  query: string,
  page = 1,
): Promise<{
  results: Array<{
    title?: string;
    url?: string;
    description?: string;
    content?: string;
    publishedDate?: string;
    engine?: string | string[];
    instance: string;
  }>;
  instance: string;
}> {
  const instances = await discoverInstances();
  const timeoutMs = Math.min(
    Math.max(Number(process.env.SEARXNG_TIMEOUT_MS) || 12_000, 3_000),
    30_000,
  );
  const language = process.env.SEARXNG_LANGUAGE || "en";
  const categories = process.env.SEARXNG_CATEGORIES || "general,news";
  const safesearch = process.env.SEARXNG_SAFESEARCH || "0";
  const timeRange = process.env.SEARXNG_TIME_RANGE;

  const configuredCount = Math.min(
    Math.max(Number(process.env.SEARXNG_INSTANCE_COUNT) || 8, 2),
    20,
  );

  const candidates = instances
    .filter((instance) => instance.cooldownUntil <= Date.now())
    .sort((a, b) => a.lastUsedAt - b.lastUsedAt)
    .slice(0, Math.max(configuredCount, 2));

  if (!candidates.length) {
    discoveryCache = null;
    const refreshed = await discoverInstances(true);
    candidates.push(
      ...refreshed
        .filter((instance) => instance.cooldownUntil <= Date.now())
        .sort((a, b) => a.lastUsedAt - b.lastUsedAt)
        .slice(0, Math.max(configuredCount, 2)),
    );
  }

  const ordered = candidates.map((_, offset) => {
    const index = (roundRobinIndex + offset) % candidates.length;
    return candidates[index];
  });
  roundRobinIndex = (roundRobinIndex + 1) % Math.max(candidates.length, 1);

  let lastError: unknown = null;
  for (const instance of ordered) {
    try {
      const results = await requestFromInstance(
        instance,
        query,
        page,
        timeoutMs,
        language,
        categories,
        safesearch,
        timeRange,
      );
      if (results.length) return { results, instance: instance.url };
      markFailure(instance);
      lastError = new Error(`${instance.url} returned zero results`);
    } catch (error) {
      markFailure(instance);
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All discovered SearXNG instances failed");
}

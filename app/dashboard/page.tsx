"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity, BarChart3, Bell, BrainCircuit, ChevronLeft, ChevronRight,
  CircleDollarSign, ExternalLink, FileText, Gauge, LayoutDashboard, Menu,
  Moon, Network, Newspaper, Settings, ShieldAlert, Sparkles, Target,
  TrendingUp, Wallet, X,
} from "lucide-react";

type Summary = {
  generatedAt: string;
  alpha: { score: number; confidence: number; regime: string };
  modules: Record<string, string>;
};
type NewsItem = {
  id: string; source: string; title: string; url: string; summary: string;
  publishedAt: string; category: string;
};
type MarketItem = {
  id: string; symbol: string; name: string; price: number; change24h: number;
  marketCap: number; volume24h: number;
};

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Live News", icon: Newspaper },
  { label: "Markets", icon: BarChart3 },
  { label: "Narratives", icon: Sparkles },
  { label: "Alpha Signals", icon: Target },
  { label: "Launches", icon: RocketIcon },
  { label: "On-chain", icon: Network },
  { label: "Wallet Intel", icon: Wallet },
  { label: "DeFi", icon: CircleDollarSign },
  { label: "Risk Engine", icon: ShieldAlert },
  { label: "Order Flow", icon: Activity },
  { label: "Macro", icon: Gauge },
  { label: "Cycles", icon: Moon },
  { label: "Thesis", icon: FileText },
  { label: "Alerts", icon: Bell },
];

function RocketIcon(props: React.ComponentProps<"svg">) {
  return <TrendingUp {...props} />;
}

function timeAgo(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function DashboardPage() {
  const [s, setS] = useState<Summary | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [status, setStatus] = useState("CONNECTING");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Overview");

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryResponse, intelResponse] = await Promise.all([
          fetch("/api/v1/dashboard/summary"),
          fetch("/api/v1/news"),
        ]);
        if (!summaryResponse.ok) throw new Error("Dashboard API offline");
        setS(await summaryResponse.json());
        if (intelResponse.ok) {
          const intel = await intelResponse.json();
          setNews(intel.news ?? []);
          setMarkets(intel.markets ?? []);
        }
        setStatus("ONLINE");
      } catch {
        setStatus("OFFLINE");
      }
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const modules = s?.modules ?? {
    narrative: "ready", launches: "planned", onchain: "planned",
    wallets: "planned", defi: "planned", risk: "ready",
    orderFlow: "planned", macro: "planned", cycles: "planned",
  };

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      {mobileOpen && (
        <button aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      <aside className={[
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#080b11] transition-all duration-200",
        collapsed ? "w-[76px]" : "w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-bold">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
              <BrainCircuit size={18} />
            </span>
            {!collapsed && <span className="truncate">CTP <span className="text-cyan-300">ALPHA</span></span>}
          </Link>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">Intelligence</div>
          <div className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <Link key={label} href={label === "Overview" ? "/dashboard" : `/dashboard/${label.toLowerCase().replaceAll(" ", "-")}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                  active === label ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/20" : "text-slate-400 hover:bg-white/5 hover:text-white",
                ].join(" ")}>
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            title={collapsed ? "Settings" : undefined}>
            <Settings size={17} />{!collapsed && "Settings"}
          </button>
          <button onClick={() => setCollapsed((v) => !v)}
            className="mt-1 hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-white/5 hover:text-white lg:flex">
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            {!collapsed && "Collapse sidebar"}
          </button>
        </div>
      </aside>

      <div className={collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070b]/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-h-10 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
                onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{active}</div>
                <div className="hidden text-xs text-slate-600 sm:block">CTP Alpha Terminal / Realtime Intelligence</div>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
              <span className={`h-2 w-2 rounded-full ${status === "ONLINE" ? "bg-emerald-400" : status === "OFFLINE" ? "bg-red-400" : "bg-amber-400"}`} />
              {status}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300 sm:text-xs">Command Center</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Alpha Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Live crypto news, market data, on-chain signals, and risk context.</p>

          <section className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3">
            {[
              ["Alpha Score", s?.alpha.score ?? 0, "/100"],
              ["Confidence", s?.alpha.confidence ?? 0, "%"],
              ["Market Regime", s?.alpha.regime ?? "NEUTRAL", ""],
            ].map(([a, b, c]) => (
              <div key={a} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-6">
                <div className="text-xs text-slate-500 sm:text-sm">{a}</div>
                <div className="mt-2 text-2xl font-black sm:mt-3 sm:text-4xl">{b}<span className="ml-1 text-sm text-slate-600 sm:text-lg">{c}</span></div>
              </div>
            ))}
          </section>

          <section className="mt-4 grid gap-4 sm:mt-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />Live Crypto News
                  </div>
                  <p className="mt-1 text-xs text-slate-600">Multi-source RSS aggregation · refresh 30s</p>
                </div>
                <span className="text-xs text-slate-500">{news.length} items</span>
              </div>
              <div className="mt-4 space-y-2">
                {news.slice(0, 8).map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer"
                    className="group block rounded-xl border border-white/5 bg-black/10 p-3 transition hover:border-cyan-400/20 hover:bg-cyan-400/[.03]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-medium text-slate-200 group-hover:text-cyan-200">{item.title}</div>
                        <div className="mt-1 text-[10px] text-slate-600">{item.source} · {timeAgo(item.publishedAt)} · {item.category}</div>
                      </div>
                      <ExternalLink size={14} className="mt-0.5 shrink-0 text-slate-700 group-hover:text-cyan-300" />
                    </div>
                  </a>
                ))}
                {!news.length && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-600">Waiting for news ingestion...</div>}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div><div className="text-sm font-bold">Market Pulse</div><p className="mt-1 text-xs text-slate-600">Top 20 by market cap</p></div>
                <TrendingUp size={16} className="text-cyan-300" />
              </div>
              <div className="mt-4 space-y-2">
                {markets.slice(0, 8).map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2.5">
                    <div><div className="text-sm font-semibold">{coin.symbol}</div><div className="text-[10px] text-slate-600">{coin.name}</div></div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{`$${coin.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}`}</div>
                      <div className={`text-[10px] ${coin.change24h >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                        {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
                {!markets.length && <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-600">Waiting for market data...</div>}
              </div>
            </div>
          </section>

          <section className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(modules).map(([name, state]) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold capitalize">{name.replace(/([A-Z])/g, " $1")}</span>
                  <span className={state === "ready" ? "text-[11px] text-emerald-300" : "text-[11px] text-amber-300"}>{state}</span>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-white/10">
                  <div className={state === "ready" ? "h-full w-full rounded-full bg-emerald-400" : "h-full w-1/3 rounded-full bg-amber-400"} />
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

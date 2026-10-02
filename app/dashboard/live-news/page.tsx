"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, ExternalLink, Filter, Newspaper, RefreshCw, Search } from "lucide-react";

type NewsItem = {
  id?: string;
  source?: string;
  title?: string;
  url?: string;
  summary?: string;
  publishedAt?: string;
  category?: string;
  image?: string;
};

function normalizeNews(payload: any): NewsItem[] {
  const items = Array.isArray(payload) ? payload : payload?.news ?? payload?.items ?? payload?.data ?? [];
  return Array.isArray(items) ? items : [];
}

function timeAgo(value?: string) {
  if (!value) return "unknown";
  const ms = Date.now() - Date.parse(value);
  if (!Number.isFinite(ms)) return value;
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function LiveNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState("LOADING");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");

  const loadNews = useCallback(async () => {
    try {
      setStatus("LOADING");
      const response = await fetch("/api/v1/news", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setNews(normalizeNews(await response.json()));
      setStatus("LIVE");
    } catch {
      setStatus("OFFLINE");
    }
  }, []);

  useEffect(() => {
    loadNews();
    const timer = window.setInterval(loadNews, 30000);
    return () => window.clearInterval(timer);
  }, [loadNews]);

  const categories = useMemo(() => {
    const values = news.map((item) => item.category?.trim()).filter(Boolean) as string[];
    return ["ALL", ...Array.from(new Set(values))];
  }, [news]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return news.filter((item) => {
      const matchesCategory = category === "ALL" || item.category === category;
      const haystack = [item.title, item.summary, item.source, item.category].filter(Boolean).join(" ").toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [news, query, category]);

  return (
    <main className="min-h-screen bg-[#05070b] text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-white/10 bg-[#080b11] lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link href="/dashboard" className="font-bold">CTP <span className="text-cyan-300">ALPHA</span></Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Intelligence</div>
          {[
            ["Overview","/dashboard"],["Live News","/dashboard/live-news"],["Markets","/dashboard/markets"],
            ["Narratives","/dashboard/narratives"],["Alpha Signals","/dashboard/alpha-signals"],["Launches","/dashboard/launches"],
            ["On-chain","/dashboard/on-chain"],["Wallet Intel","/dashboard/wallet-intel"],["DeFi","/dashboard/defi"],
            ["Risk Engine","/dashboard/risk-engine"],["Order Flow","/dashboard/order-flow"],["Macro","/dashboard/macro"],
            ["Cycles","/dashboard/cycles"],["Thesis","/dashboard/thesis"],["Alerts","/dashboard/alerts"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className={`mb-1 block rounded-xl px-3 py-2.5 text-sm ${label === "Live News" ? "bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05070b]/90 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold"><Newspaper size={17} className="text-cyan-300" /> Live News</div>
              <div className="mt-1 text-xs text-slate-600">Realtime crypto intelligence · automatic refresh every 30 seconds</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className={`h-2 w-2 rounded-full ${status === "LIVE" ? "bg-emerald-400" : status === "OFFLINE" ? "bg-red-400" : "bg-amber-400"}`} />{status}</span>
              <button onClick={loadNews} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white" title="Refresh news"><RefreshCw size={16} /></button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">Market Intelligence</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Crypto News Feed</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">Berita crypto dikumpulkan oleh backend CTP dan ditampilkan sebagai feed intelligence tanpa mengekspos endpoint API internal.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.025] px-3">
                <Search size={15} className="text-slate-600" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search news..." className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-700 sm:w-56" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.025] px-3">
                <Filter size={15} className="text-slate-600" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-transparent py-2.5 text-sm text-slate-300 outline-none">
                  {categories.map((item) => <option key={item} value={item} className="bg-[#080b11]">{item}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-xs text-slate-600">Total Stories</div><div className="mt-2 text-2xl font-black">{filtered.length}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-xs text-slate-600">Sources</div><div className="mt-2 text-2xl font-black">{new Set(news.map((x) => x.source).filter(Boolean)).size}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-xs text-slate-600">Feed Status</div><div className="mt-2 text-2xl font-black">{status}</div></div>
          </div>

          <section className="grid gap-4">
            {filtered.map((item, index) => (
              <article key={item.id ?? `${item.url}-${index}`} className="group rounded-2xl border border-white/10 bg-white/[.025] p-4 transition hover:border-cyan-400/20 hover:bg-cyan-400/[.02] sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  {item.image && <img src={item.image} alt="" className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-40" />}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600">
                      <span className="text-cyan-300">{item.source ?? "Unknown source"}</span>
                      {item.category && <><span>·</span><span>{item.category}</span></>}
                      <span>·</span><span className="flex items-center gap-1"><Clock3 size={11} />{timeAgo(item.publishedAt)}</span>
                    </div>
                    <h2 className="text-base font-bold leading-6 text-slate-100 sm:text-lg">{item.title ?? "Untitled story"}</h2>
                    {item.summary && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{item.summary}</p>}
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200">Read source <ArrowUpRight size={14} /></a>}
                  </div>
                  <ExternalLink size={16} className="hidden shrink-0 text-slate-700 group-hover:text-cyan-300 sm:block" />
                </div>
              </article>
            ))}
            {!filtered.length && (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                <Newspaper className="mx-auto text-slate-700" size={32} />
                <div className="mt-3 text-sm text-slate-500">{status === "OFFLINE" ? "News API sedang offline." : "Belum ada berita yang cocok."}</div>
                <button onClick={loadNews} className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-400 hover:bg-white/5">Reload feed</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import {
  Activity, BarChart3, Bell, BrainCircuit, CircleDollarSign, FileText, Gauge,
  LayoutDashboard, Moon, Network, Newspaper, Settings, ShieldAlert, Sparkles,
  Target, TrendingUp, Wallet, RefreshCw, Clock3, AlertTriangle
} from "lucide-react";
 import { useCallback, useEffect, useMemo, useState } from "react";

type ModuleKey =
  | "overview" | "live-news" | "markets" | "narratives" | "alpha-signals" | "launches"
  | "on-chain" | "wallet-intel" | "defi" | "risk-engine" | "order-flow" | "macro"
  | "cycles" | "thesis" | "alerts" | "settings";

type NewsItem = {
  id: string; source: string; title: string; url: string; summary: string;
  publishedAt: string; category: "news" | "market" | "defi" | "security" | "macro";
};
type MarketItem = {
  id: string; symbol: string; name: string; price: number;
  change24h: number; marketCap: number; volume24h: number;
};
type IntelResponse = {
  generatedAt: string; refreshMs: number; count: number;
  news: NewsItem[]; markets: MarketItem[]; sources: string[];
};

const navigation = [
  ["Overview","/dashboard",LayoutDashboard,"overview"],
  ["Live News","/dashboard/live-news",Newspaper,"live-news"],
  ["Markets","/dashboard/markets",BarChart3,"markets"],
  ["Narratives","/dashboard/narratives",Sparkles,"narratives"],
  ["Alpha Signals","/dashboard/alpha-signals",Target,"alpha-signals"],
  ["Launches","/dashboard/launches",TrendingUp,"launches"],
  ["On-chain","/dashboard/on-chain",Network,"on-chain"],
  ["Wallet Intel","/dashboard/wallet-intel",Wallet,"wallet-intel"],
  ["DeFi","/dashboard/defi",CircleDollarSign,"defi"],
  ["Risk Engine","/dashboard/risk-engine",ShieldAlert,"risk-engine"],
  ["Order Flow","/dashboard/order-flow",Activity,"order-flow"],
  ["Macro","/dashboard/macro",Gauge,"macro"],
  ["Cycles","/dashboard/cycles",Moon,"cycles"],
  ["Thesis","/dashboard/thesis",FileText,"thesis"],
  ["Alerts","/dashboard/alerts",Bell,"alerts"],
  ["Settings","/dashboard/settings",Settings,"settings"],
] as const;

const meta: Record<ModuleKey, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "Command Center", title: "Overview", description: "Pusat kendali CTP Alpha Terminal: news, market state, alpha pipeline, dan risk context." },
  "live-news": { eyebrow: "Information Flow", title: "Live News", description: "Feed berita crypto multi-source yang diperbarui otomatis untuk headline, catalyst, narrative shift, dan risk event." },
  markets: { eyebrow: "Market Intelligence", title: "Markets", description: "Market scanner berbasis price, 24h change, market cap, dan volume dari live market feed." },
  narratives: { eyebrow: "Narrative Intelligence", title: "Narratives", description: "Ekstraksi tema pasar dari headline live dan pengelompokan aset yang relevan." },
  "alpha-signals": { eyebrow: "Signal Engine", title: "Alpha Signals", description: "Ruang validasi signal yang memisahkan data observed dari inference dan risk." },
  launches: { eyebrow: "Launch Intelligence", title: "Launches", description: "Radar token/pair baru, promotion activity, dan launch-risk inputs dari DEX Screener." },
  "on-chain": { eyebrow: "On-chain Forensics", title: "On-chain", description: "Workspace untuk transaksi, wallet clusters, deployer, CEX flow, dan anomaly checks." },
  "wallet-intel": { eyebrow: "Wallet Intelligence", title: "Wallet Intel", description: "Registry dan activity tracker untuk smart money, whales, deployer, dan CEX wallets." },
  defi: { eyebrow: "DeFi Intelligence", title: "DeFi", description: "Monitor pool, TVL, yield, fees, LP risk, dan funding/basis opportunities." },
  "risk-engine": { eyebrow: "Risk Management", title: "Risk Engine", description: "Position sizing dan portfolio guardrails sebelum signal diteruskan ke execution." },
  "order-flow": { eyebrow: "Institutional Order Flow", title: "Order Flow", description: "Volume profile, VWAP, imbalance, absorption, dan institutional liquidity levels." },
  macro: { eyebrow: "Macro Intelligence", title: "Macro", description: "Kalender macro dan event-risk context untuk CPI, FOMC, PPI, NFP, rates, dan DXY." },
  cycles: { eyebrow: "Cycle Timing", title: "Cycles", description: "Market-cycle, halving, Wyckoff, seasonality, dan timing context." },
  thesis: { eyebrow: "Research Workspace", title: "Thesis", description: "Menyusun dan menguji thesis dengan evidence, catalyst, target, dan invalidation." },
  alerts: { eyebrow: "Alert Center", title: "Alerts", description: "Pusat event monitoring untuk price, volume, liquidity, wallet, news, macro, dan risk." },
  settings: { eyebrow: "System", title: "Settings", description: "Status API, data sources, AI provider, refresh interval, dan notification configuration." },
};

const formatUsd = (value: number) => {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1e12) return "$" + (value / 1e12).toFixed(2) + "T";
  if (Math.abs(value) >= 1e9) return "$" + (value / 1e9).toFixed(2) + "B";
  if (Math.abs(value) >= 1e6) return "$" + (value / 1e6).toFixed(2) + "M";
  if (Math.abs(value) >= 1e3) return "$" + (value / 1e3).toFixed(2) + "K";
  return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 4 });
};
const formatPrice = (value: number) => {
  if (value >= 1000) return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 1) return "$" + value.toFixed(3);
  if (value >= 0.01) return "$" + value.toFixed(5);
  return "$" + value.toPrecision(5);
};
const age = (iso: string) => {
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms)) return "—";
  const min = Math.max(0, Math.floor(ms / 60000));
  if (min < 60) return min + "m ago";
  const h = Math.floor(min / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#080b11] p-3 sm:p-5">
    <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><span className="text-[10px] uppercase tracking-[.18em] text-emerald-400">Live</span></div>
    {children}
  </section>;
}
function EmptyState({ title = "Data source belum terhubung", detail = "Modul ini sudah disiapkan, tetapi provider live belum dikonfigurasi." }) {
  return <div className="rounded-xl border border-dashed border-white/10 bg-white/[.02] p-6 text-center"><AlertTriangle size={18} className="mx-auto text-slate-600"/><div className="mt-3 text-sm text-slate-400">{title}</div><div className="mt-1 text-xs leading-5 text-slate-600">{detail}</div></div>;
}
function Kpi({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[.025] p-3.5 sm:p-5"><div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">{label}</div><div className="mt-3 text-xl font-bold text-slate-100">{value}</div>{detail && <div className="mt-1 text-[11px] text-slate-600">{detail}</div>}</div>;
}
function relativeTime(value: string) {
  const diff = Math.max(0, Date.now() - Date.parse(value));
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return minutes + "m";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h";
  return Math.floor(hours / 24) + "d";
}

function NewsList({ news }: { news: NewsItem[] }) {
  return <div className="space-y-2.5">{news.slice(0, 20).map((item) => (
    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-2xl border border-white/[.07] bg-gradient-to-br from-white/[.035] to-white/[.015] p-4 transition hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-cyan-400/[.025]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[.06] text-cyan-300"><Newspaper size={16}/></div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600">
            <span className="text-cyan-300/80">{item.source}</span><span>•</span><span>{relativeTime(item.publishedAt)}</span><span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px]">{item.category}</span>
          </div>
          <div className="line-clamp-2 text-sm font-semibold leading-5 text-slate-200 transition group-hover:text-white">{item.title}</div>
          {item.summary && <div className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{item.summary}</div>}
        </div>
        <ExternalLink size={14} className="mt-1 shrink-0 text-slate-700 transition group-hover:text-cyan-300"/>
      </div>
    </a>
  ))}</div>;
}
function LiveNewsModule({ intel }: { intel: IntelResponse | null }) {
  const news = intel?.news ?? [];
  const categories = useMemo(() => [...new Set(news.map((n) => n.category))], [news]);
  const risk = news.filter((n) => n.category === "security" || n.category === "macro").length;
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Live Stories" value={String(news.length)} detail="deduplicated feed"/><Kpi label="Sources" value={String(intel?.sources.length ?? 0)} detail="active RSS sources"/><Kpi label="Categories" value={String(categories.length)}/><Kpi label="Risk Mentions" value={String(risk)} detail="security + macro"/></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]"><Section title="Realtime News Feed">{news.length ? <NewsList news={news}/> : <EmptyState title="News feed kosong"/>}</Section><div className="space-y-5"><Section title="Source Monitor"><div className="space-y-2">{(intel?.sources ?? []).map((s)=><div key={s} className="flex justify-between rounded-lg border border-white/5 px-3 py-2 text-xs"><span className="text-slate-300">{s}</span><span className="text-emerald-400">online</span></div>)}</div></Section><Section title="News Intelligence"><div className="space-y-2">{["Catalyst detection","Narrative extraction","Duplicate filtering","Security / macro classification"].map(x=><div key={x} className="rounded-lg bg-white/[.02] px-3 py-2 text-xs text-slate-400">{x}</div>)}</div></Section></div></div>
  </div>;
}
function MarketsModule({ intel }: { intel: IntelResponse | null }) {
  const markets = intel?.markets ?? [];
  const gainers = [...markets].sort((a,b)=>b.change24h-a.change24h).slice(0,5);
  const losers = [...markets].sort((a,b)=>a.change24h-b.change24h).slice(0,5);
  const volume = [...markets].sort((a,b)=>b.volume24h-a.volume24h)[0];
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Tracked Assets" value={String(markets.length)} detail="CoinGecko market feed"/><Kpi label="Top Volume" value={volume?.symbol ?? "—"} detail={volume ? formatUsd(volume.volume24h) : "no data"}/><Kpi label="Top Gainer" value={gainers[0] ? gainers[0].symbol + " " + (gainers[0].change24h >= 0 ? "+" : "") + gainers[0].change24h.toFixed(2) + "%" : "—"}/><Kpi label="Top Loser" value={losers[0] ? losers[0].symbol + " " + losers[0].change24h.toFixed(2) + "%" : "—"}/></div>
    <Section title="Live Market Scanner">{markets.length ? <MarketTable markets={markets}/> : <EmptyState title="Market feed kosong"/>}</Section>
    <div className="grid gap-5 xl:grid-cols-2"><Section title="Top Gainers"><MarketTable markets={gainers}/></Section><Section title="Top Losers"><MarketTable markets={losers}/></Section></div>
  </div>;
}
function NarrativesModule({ intel }: { intel: IntelResponse | null }) {
  const news = intel?.news ?? [];
  const themes = [
    ["AI", /(ai|artificial intelligence|agent|gpu)/i],["DeFi", /(defi|dex|yield|lending|staking|liquidity)/i],
    ["Memecoins", /(meme|memecoin|doge|shib|pepe)/i],["RWA", /(rwa|tokeni[sz]ation|real.world asset)/i],
    ["Infrastructure", /(layer.?2|rollup|bridge|infrastructure|scaling)/i],["Bitcoin", /(bitcoin|btc|halving)/i],
  ].map(([name,re])=>[String(name),news.filter(n=>(re as RegExp).test(n.title+" "+n.summary)).length] as const).sort((a,b)=>b[1]-a[1]);
  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Narratives Detected" value={String(themes.filter(x=>x[1]>0).length)} detail="derived from live headlines"/><Kpi label="Emerging Signals" value={String(themes.filter(x=>x[1]>=3).length)} detail="3+ matching stories"/><Kpi label="Catalyst Stories" value={String(news.filter(n=>n.category==="market"||n.category==="macro").length)}/><Kpi label="News Corpus" value={String(news.length)}/></div><div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_minmax(0,1.5fr)]"><Section title="Narrative Radar"><div className="space-y-2">{themes.map(([name,count])=><div key={name} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[.02] p-3"><span className="text-sm text-slate-300">{name}</span><span className="font-mono text-cyan-300">{count} stories</span></div>)}</div></Section><Section title="Narrative Evidence">{news.length ? <NewsList news={news.slice(0,10)}/> : <EmptyState/>}</Section></div></div>;
}
function OverviewModule({ intel }: { intel: IntelResponse | null }) {
  const markets = intel?.markets ?? [], news = intel?.news ?? [];
  const btc = markets.find(m=>m.symbol==="BTC"), eth = markets.find(m=>m.symbol==="ETH"), sol = markets.find(m=>m.symbol==="SOL");
  const avg = markets.length ? markets.reduce((a,m)=>a+m.change24h,0)/markets.length : 0;
  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Market Breadth" value={markets.length ? (avg>=0?"+":"")+avg.toFixed(2)+"%" : "—"} detail="average 24h change"/><Kpi label="Live Stories" value={String(news.length)} detail="multi-source news"/><Kpi label="BTC" value={btc ? formatPrice(btc.price)+" "+(btc.change24h>=0?"+":"")+btc.change24h.toFixed(2)+"%" : "—"}/><Kpi label="ETH / SOL" value={eth&&sol ? eth.change24h.toFixed(1)+"% / "+sol.change24h.toFixed(1)+"%" : "—"} detail="24h change"/></div><div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,1fr)]"><Section title="Alpha Pipeline"><div className="grid gap-2 sm:grid-cols-2">{["Live news discovery","Market confirmation","Narrative extraction","Liquidity / momentum","Risk validation","Thesis review"].map((x,i)=><div key={x} className="rounded-xl border border-white/5 p-3"><div className="text-[10px] text-slate-600">0{i+1}</div><div className="mt-1 text-sm text-slate-300">{x}</div></div>)}</div></Section><Section title="Latest Intelligence">{news.length ? <NewsList news={news.slice(0,7)}/> : <EmptyState/>}</Section></div></div>;
}
function OperationalModule({ module, intel }: { module: ModuleKey; intel: IntelResponse | null }) {
  const [launches, setLaunches] = useState<Record<string, unknown> | null>(null);
  const [launchError, setLaunchError] = useState("");
  useEffect(() => {
    if (module !== "launches") return;
    const loadLaunches = async () => {
      try {
        const endpoints = ["token-profiles/latest", "token-profiles/recent", "token-boosts/latest", "token-boosts/top", "ads/latest", "community-takeovers/latest"];
        const entries = await Promise.all(endpoints.map(async (endpoint) => {
          const response = await fetch("/api/v1/dex/" + endpoint, { cache: "no-store" });
          if (!response.ok) throw new Error(endpoint + " HTTP " + response.status);
          return [endpoint, await response.json()] as const;
        }));
        setLaunches(Object.fromEntries(entries));
        setLaunchError("");
      } catch (e) {
        setLaunchError(e instanceof Error ? e.message : "DEX Screener request failed");
      }
    };
    void loadLaunches();
    const timer = window.setInterval(() => void loadLaunches(), 15000);
    return () => window.clearInterval(timer);
  }, [module]);

  const data: Record<string,{title:string;items:string[];note:string}> = {
    "alpha-signals":{title:"Signal Validation",items:["Market regime","News catalyst","Narrative confirmation","Momentum confirmation","Liquidity check","Risk / invalidation"],note:"Signal scoring membutuhkan market + on-chain inputs. Tidak ada LONG/SHORT palsu yang ditampilkan."},
    launches:{title:"Launch Radar",items:["New token profiles","Recent profile updates","Token boosts","Top boosts","Ads activity","Community takeovers"],note:"Sumber live: DEX Screener API. Detail token/pair akan ditampilkan melalui query chain/address."},
    "on-chain":{title:"On-chain Forensics",items:["Transaction flow","Deployer tracing","Funding source","CEX destination","Wallet clusters","Wash-trading checks"],note:"RPC/indexer belum dikonfigurasi; UI tidak mengarang transaksi."},
    "wallet-intel":{title:"Wallet Registry",items:["Smart money","Whales","Deployers","CEX wallets","Wallet activity","Cluster confirmation"],note:"Wallet tracker memerlukan address + RPC/indexer provider."},
    defi:{title:"DeFi Position Monitor",items:["Pool TVL","Volume","Fees","APR/APY","Impermanent loss","Contract risk"],note:"Pool provider belum dikonfigurasi; struktur risiko dipisahkan dari data live."},
    "risk-engine":{title:"Position Risk",items:["Account equity","Risk per trade","Entry / stop","Position size","R:R","Portfolio exposure"],note:"Risk engine deterministic; AI tidak menentukan ukuran posisi secara langsung."},
    "order-flow":{title:"Institutional Flow",items:["Volume profile","POC / value area","VWAP","Anchored VWAP","Delta / imbalance","Absorption"],note:"Order-book/trade stream provider belum aktif."},
    macro:{title:"Macro Event Monitor",items:["CPI","FOMC","PPI","NFP","DXY","Treasury yields"],note:"Macro calendar provider belum aktif; jangan menampilkan event dummy."},
    cycles:{title:"Cycle Context",items:["Accumulation","Markup","Distribution","Markdown","Halving timeline","Wyckoff context"],note:"Cycle module membutuhkan time-series/historical provider."},
    thesis:{title:"Thesis Workspace",items:["Setup","Catalyst","Evidence","Entry","Target","Invalidation"],note:"Thesis harus menyimpan evidence yang berasal dari data terminal."},
    alerts:{title:"Alert Rules",items:["Price threshold","Volume spike","Liquidity change","Wallet event","News keyword","Macro event"],note:"Rule engine dapat dipetakan ke Redis/BullMQ dan channel notification."},
    settings:{title:"System Status",items:["API","News feed","Market feed","DEX Screener","NVIDIA AI","Redis / Worker"],note:"Status harus berasal dari health check, bukan label dummy."},
  };
  const d=data[module]; if(!d) return null;
  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Module" value={meta[module].title}/><Kpi label="News Feed" value={intel ? "ONLINE":"OFFLINE"} detail={intel ? String(intel.news.length)+" stories":"no response"}/><Kpi label="Market Feed" value={intel?.markets.length ? "ONLINE":"NO DATA"} detail="CoinGecko"/><Kpi label="Refresh" value={intel ? Math.round(intel.refreshMs/1000)+"s":"—"}/></div><Section title={d.title}><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{d.items.map(x=><div key={x} className="rounded-xl border border-white/5 bg-white/[.02] p-4"><div className="text-sm text-slate-300">{x}</div><div className="mt-2 text-[10px] uppercase tracking-wider text-slate-600">{module==="settings"?"status check":"data input"}</div></div>)}</div><div className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[.03] p-4 text-xs leading-5 text-slate-500">{d.note}</div></Section>{module==="launches"&&<Section title="Live DEX Screener Feeds">{launchError&&<div className="mb-3 rounded-xl border border-rose-400/10 bg-rose-400/[.03] p-3 text-xs text-rose-300">{launchError}</div>}<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{["token-profiles/latest","token-profiles/recent","token-boosts/latest","token-boosts/top","ads/latest","community-takeovers/latest"].map(key=>{const value=launches?.[key];const count=Array.isArray(value)?value.length:(value&&typeof value==="object"&&Array.isArray((value as {pairs?:unknown[]}).pairs)?(value as {pairs:unknown[]}).pairs.length:0);return <div key={key} className="rounded-xl border border-white/5 bg-white/[.02] p-4"><div className="text-xs text-slate-400">{key}</div><div className="mt-2 text-xl font-bold text-slate-200">{launches?count:"—"}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">records</div></div>})}</div></Section>}{module==="settings"&&<Section title="Current News Sources"><div className="grid gap-2 sm:grid-cols-2">{(intel?.sources??[]).map(s=><div key={s} className="rounded-xl border border-white/5 p-3 text-xs text-slate-300">{s}<span className="float-right text-emerald-400">online</span></div>)}</div></Section>}</div>;
}

export default function IntelligenceModule({ module }: { module: ModuleKey }) {
  const data=meta[module];
  const [intel,setIntel]=useState<IntelResponse|null>(null), [error,setError]=useState(""), [lastUpdate,setLastUpdate]=useState("");
  const [realtimeStatus,setRealtimeStatus]=useState<"connecting"|"live"|"offline">("connecting");
  const [mobileNav,setMobileNav]=useState(false);
  const [realtimeEvents,setRealtimeEvents]=useState(0);
  const load=useCallback(async()=>{try{const response=await fetch("/api/v1/news",{cache:"no-store"});if(!response.ok)throw new Error("API "+response.status);const json=await response.json() as IntelResponse;setIntel(json);setLastUpdate(new Date().toISOString());setError("");}catch(e){setError(e instanceof Error?e.message:"Unable to load intelligence feed");}},[]);
  useEffect(()=>{void load();const timer=window.setInterval(()=>void load(),15000);return()=>window.clearInterval(timer);},[load]);
  useEffect(()=>{
    const source=new EventSource("/api/v1/realtime/events");
    source.onopen=()=>setRealtimeStatus("live");
    source.onmessage=()=>setRealtimeEvents(v=>v+1);
    source.onerror=()=>setRealtimeStatus("offline");
    return()=>source.close();
  },[]);
  return <main className="min-h-screen overflow-x-hidden bg-[#05070b] text-white"><div className={"fixed inset-0 z-50 lg:hidden "+(mobileNav?"":"pointer-events-none invisible")}><button aria-label="Close menu" onClick={()=>setMobileNav(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"/><aside className={"absolute inset-y-0 left-0 flex w-[min(86vw,300px)] flex-col border-r border-white/10 bg-[#080b11] shadow-2xl transition-transform duration-200 "+(mobileNav?"translate-x-0":"-translate-x-full")}><div className="flex h-16 items-center border-b border-white/10 px-5"><Link href="/dashboard" className="flex items-center gap-2 font-bold"><BrainCircuit size={18} className="text-cyan-300"/>CTP <span className="text-cyan-300">ALPHA</span></Link></div><nav className="flex-1 overflow-y-auto p-3"><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Intelligence</div>{navigation.map(([label,href,Icon,key])=><Link key={label} href={href} className={"mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm "+(module===key?"bg-cyan-400/10 text-cyan-200":"text-slate-400 hover:bg-white/5 hover:text-white")}><Icon size={17}/>{label}</Link>)}</nav><div className="border-t border-white/10 p-4 text-[10px] uppercase tracking-wider text-slate-600">Auto refresh 15s</div></aside></div><aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-white/10 bg-[#080b11] lg:flex"><div className="flex h-16 items-center border-b border-white/10 px-5"><Link href="/dashboard" className="flex items-center gap-2 font-bold"><BrainCircuit size={18} className="text-cyan-300"/>CTP <span className="text-cyan-300">ALPHA</span></Link></div><nav className="flex-1 overflow-y-auto p-3"><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Intelligence</div>{navigation.map(([label,href,Icon,key])=><Link key={label} href={href} className={"mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm "+(module===key?"bg-cyan-400/10 text-cyan-200":"text-slate-400 hover:bg-white/5 hover:text-white")}><Icon size={17}/>{label}</Link>)}</nav><div className="border-t border-white/10 p-4 text-[10px] uppercase tracking-wider text-slate-600">Auto refresh 15s</div></aside><div className="lg:pl-[260px]"><header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070b]/90 px-4 py-4 backdrop-blur"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><button onClick={()=>setMobileNav(true)} className="rounded-xl border border-white/10 bg-white/[.03] p-2 text-slate-300 lg:hidden" aria-label="Open navigation"><Activity size={17}/></button><div className="truncate text-sm font-semibold">{data.title}</div></div><div className="flex shrink-0 items-center gap-2 text-[10px] text-slate-600 sm:gap-3 sm:text-[11px]"><Clock3 size={14}/><span className={realtimeStatus==="live"?"text-emerald-400":"text-amber-400"}>{realtimeStatus==="live"?"LIVE":"CONNECTING"}</span><span>{realtimeEvents} events</span>{lastUpdate?"updated "+age(lastUpdate):"connecting"}<button onClick={()=>void load()} className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white" aria-label="Refresh"><RefreshCw size={14}/></button></div></div></header><div className="mx-auto w-full max-w-[1500px] p-3 sm:p-5 md:p-6 lg:p-10"><Link href="/dashboard" className="text-xs text-cyan-300 hover:text-cyan-200">← Command Center</Link><div className="mt-5 border-b border-white/10 pb-5 sm:mt-6 sm:pb-6"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">{data.eyebrow}</p><h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">{data.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{data.description}</p>{error&&<div className="mt-4 rounded-xl border border-rose-400/10 bg-rose-400/[.03] px-4 py-3 text-xs text-rose-300">Live API error: {error}</div>}</div><div className="mt-5 sm:mt-6">{module==="overview"&&<OverviewModule intel={intel}/>} {module==="live-news"&&<LiveNewsModule intel={intel}/>} {module==="markets"&&<MarketsModule intel={intel}/>} {module==="narratives"&&<NarrativesModule intel={intel}/>} {!["overview","live-news","markets","narratives"].includes(module)&&<OperationalModule module={module} intel={intel}/>}</div></div></div></main>;
}

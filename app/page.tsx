"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  Check,
  CircleDollarSign,
  Gauge,
  Globe2,
  Layers3,
  Menu,
  Moon,
  Network,
  Newspaper,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";

const capabilities = [
  { icon: Newspaper, label: "Live News", title: "News → narrative intelligence", text: "Aggregate crypto news into source-aware stories, themes, catalysts, and risk mentions so research starts with evidence instead of noise." },
  { icon: SparkIcon, label: "Narratives", title: "Track narratives as they evolve", text: "Map emerging themes, catalysts, assets, and lifecycle stages across the market." },
  { icon: Network, label: "On-chain", title: "Follow the money", text: "Build a forensic view of transactions, deployers, liquidity flows, CEX movements, and wallet behavior." },
  { icon: Wallet, label: "Wallet Intel", title: "Know who is moving", text: "Track smart money, whales, deployers, and wallet activity with thesis-oriented context." },
  { icon: CircleDollarSign, label: "DeFi", title: "Monitor DeFi risk", text: "Evaluate pools, TVL, yield, fees, LP exposure, and liquidity conditions in one workspace." },
  { icon: ShieldCheck, label: "Risk Engine", title: "Risk before execution", text: "Structure position sizing, exposure, invalidation, and risk/reward context before a thesis becomes a position." },
  { icon: Activity, label: "Order Flow", title: "Read market structure", text: "Organize volume, VWAP, imbalance, profile, and institutional-level context." },
  { icon: Gauge, label: "Macro", title: "Connect crypto to macro", text: "Keep CPI, FOMC, DXY, liquidity conditions, and event risk visible alongside market data." },
  { icon: Moon, label: "Cycles", title: "Context across cycles", text: "Combine Bitcoin cycle, halving, Wyckoff, seasonality, and timing context." },
];

const workflow = [
  ["01", "Discover", "News, market data, narratives, launches, and on-chain events enter the research pipeline."],
  ["02", "Validate", "Cross-check liquidity, wallet behavior, market structure, catalysts, and data quality."],
  ["03", "Score", "Evidence is organized into deterministic factors and risk context. AI helps interpret; it does not replace source data."],
  ["04", "Execute", "Turn validated research into a thesis, watchlist, alert, or structured execution plan."],
];

const modules = [
  ["Trading Terminal", "Chart, watchlist, market overview, economic calendar, alpha context, and live news."],
  ["AI Assistant", "Ask questions against structured terminal context with explicit evidence, inference, and unknown states."],
  ["Launch Radar", "Monitor new tokens, pairs, liquidity events, and promotion signals."],
  ["Alpha Signals", "Review signal factors, confidence context, invalidation, and execution planning."],
  ["Thesis", "Record evidence, assumptions, invalidation, review notes, and thesis lifecycle."],
  ["Alerts", "Create a central workspace for triggered events and delivery rules."],
];

const chains = ["Solana", "Ethereum", "Base", "Arbitrum", "BNB Chain", "Polygon", "TRON", "Aptos", "Sui"];

function SparkIcon(props: ComponentProps<typeof Layers3>) {
  return <Layers3 {...props} />;
}

function LandingPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const checkAuth = () => setAuthenticated(localStorage.getItem("ctp_alpha_authenticated") === "true");
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const closeMenu = () => setMobileMenu(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-white selection:bg-cyan-300 selection:text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(34,211,238,.14),transparent_34%),radial-gradient(circle_at_100%_30%,rgba(59,130,246,.07),transparent_28%)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070b]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-lg font-black text-cyan-300">α</div>
            <div>
              <div className="text-sm font-black tracking-tight">CTP ALPHA</div>
              <div className="text-[8px] uppercase tracking-[.3em] text-slate-600">Intelligence Terminal</div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-xs text-slate-500 md:flex">
            <a href="#platform" className="hover:text-white">Platform</a>
            <a href="#workflow" className="hover:text-white">Workflow</a>
            <a href="#modules" className="hover:text-white">Modules</a>
            <a href="#architecture" className="hover:text-white">Architecture</a>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {authenticated ? (
              <Link href="/dashboard" className="rounded-xl bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-200">Open Terminal</Link>
            ) : (
              <Link href="/login" className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/15">Sign in</Link>
            )}
          </div>

          <button className="rounded-xl border border-white/10 p-2 text-slate-300 md:hidden" onClick={() => setMobileMenu(v => !v)} aria-label="Toggle menu">
            {mobileMenu ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </nav>
        {mobileMenu && (
          <div className="border-t border-white/10 bg-[#080b11] px-5 py-4 md:hidden">
            <div className="grid gap-1 text-sm">
              {["platform", "workflow", "modules", "architecture"].map(id => (
                <a key={id} href={"#" + id} onClick={closeMenu} className="rounded-xl px-3 py-3 capitalize text-slate-400 hover:bg-white/5 hover:text-white">{id}</a>
              ))}
              <Link href={authenticated ? "/dashboard" : "/login"} onClick={closeMenu} className="mt-2 rounded-xl bg-cyan-300 px-4 py-3 text-center text-sm font-bold text-slate-950">{authenticated ? "Open Terminal" : "Sign in"}</Link>
            </div>
          </div>
        )}
      </header>

      <section className="relative z-10 border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-20 lg:grid-cols-[1.08fr_.92fr] lg:px-10 lg:pb-32 lg:pt-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.22em] text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300"/> On-chain intelligence platform
            </div>
            <h1 className="max-w-5xl text-5xl font-black leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-[88px]">
              Research the market.
              <span className="block text-cyan-300">Build the thesis.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              CTP Alpha Terminal menyatukan market intelligence, live crypto news, narrative discovery, on-chain forensics, wallet intelligence, DeFi, order flow, macro, cycle context, AI analysis, dan risk management dalam satu research workspace.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={authenticated ? "/dashboard" : "/login"} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-cyan-200">
                {authenticated ? "Open Terminal" : "Enter Terminal"} <ArrowRight size={16}/>
              </Link>
              <a href="#platform" className="rounded-xl border border-white/10 bg-white/[.03] px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/[.06]">Explore Platform</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[.18em] text-slate-600">
              <span className="inline-flex items-center gap-2"><Check size={13} className="text-emerald-400"/> Evidence-first</span>
              <span className="inline-flex items-center gap-2"><Check size={13} className="text-emerald-400"/> Multi-chain</span>
              <span className="inline-flex items-center gap-2"><Check size={13} className="text-emerald-400"/> AI-assisted</span>
              <span className="inline-flex items-center gap-2"><Check size={13} className="text-emerald-400"/> Risk-aware</span>
            </div>
          </div>

          <div className="relative lg:pt-5">
            <div className="absolute -inset-8 rounded-full bg-cyan-400/5 blur-3xl"/>
            <div className="relative rounded-3xl border border-white/10 bg-white/[.025] p-3 shadow-2xl shadow-cyan-950/20">
              <div className="rounded-2xl border border-white/10 bg-[#080b11] p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold"><Activity size={15} className="text-cyan-300"/> ALPHA MONITOR</div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">● system ready</span>
                </div>
                <div className="py-7">
                  <div className="text-xs uppercase tracking-widest text-slate-600">Composite research score</div>
                  <div className="mt-2 flex items-end gap-2"><span className="text-7xl font-black tracking-tight">87</span><span className="pb-2 text-xl text-slate-600">/100</span></div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[87%] rounded-full bg-cyan-300"/></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Narrative", "92"], ["On-chain", "88"], ["Smart Money", "84"], ["Risk", "79"],
                  ].map(([name, value]) => <div key={name} className="rounded-xl border border-white/10 bg-white/[.025] p-4"><div className="text-[10px] uppercase tracking-widest text-slate-600">{name}</div><div className="mt-1 text-2xl font-black">{value}</div></div>)}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded-xl border border-white/5 bg-white/[.02] p-3"><div className="text-slate-600">BTC</div><div className="mt-1 font-bold text-slate-300">Market</div></div>
                  <div className="rounded-xl border border-white/5 bg-white/[.02] p-3"><div className="text-slate-600">Flow</div><div className="mt-1 font-bold text-emerald-300">Tracked</div></div>
                  <div className="rounded-xl border border-white/5 bg-white/[.02] p-3"><div className="text-slate-600">News</div><div className="mt-1 font-bold text-cyan-300">Live</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="relative z-10 mx-auto max-w-7xl scroll-mt-20 px-5 py-24 lg:px-10">
        <div className="max-w-3xl">
          <div className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">One research workspace</div>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">From raw market events to structured intelligence.</h2>
          <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">Setiap modul memiliki fungsi spesifik, tetapi semuanya dirancang agar evidence dapat dibaca sebagai satu konteks penelitian.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({icon: Icon, label, title, text}) => (
            <div key={label} className="group rounded-2xl border border-white/10 bg-white/[.02] p-6 transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-white/[.035]">
              <div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/15 bg-cyan-400/5 text-cyan-300"><Icon size={18}/></div><span className="text-[9px] font-bold uppercase tracking-[.22em] text-slate-700">{label}</span></div>
              <h3 className="mt-7 text-lg font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="relative z-10 border-y border-white/10 bg-white/[.015] scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">Research workflow</div>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">A repeatable path from discovery to thesis.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-500">CTP Alpha memisahkan data, inference, dan keputusan penelitian agar reasoning dapat ditinjau kembali.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {workflow.map(([number, title, text]) => (
                <div key={number} className="rounded-2xl border border-white/10 bg-[#080b11] p-6">
                  <div className="text-xs font-black text-cyan-300">{number}</div>
                  <h3 className="mt-8 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="relative z-10 mx-auto max-w-7xl scroll-mt-20 px-5 py-24 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">Terminal modules</div>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">Built for deep crypto research.</h2>
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">View command center <ArrowRight size={15}/></Link>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, text], i) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-white/10 p-5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-black text-slate-500">{String(i + 1).padStart(2, "0")}</div>
              <div><h3 className="font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="architecture" className="relative z-10 border-y border-white/10 bg-[#080b11] scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">Data architecture</div>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">Designed as an intelligence stack.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">Frontend, API, workers, database, queue, realtime transport, and external intelligence providers dipisahkan agar pipeline dapat berkembang tanpa menjadikan UI sebagai sumber kebenaran data.</p>
              <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {["Next.js", "Express.js", "PostgreSQL", "Prisma", "Redis", "BullMQ", "WebSocket / SSE", "NVIDIA AI", "Nginx + Cloudflare"].map(item => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/[.025] px-3 py-3 text-xs font-semibold text-slate-400">{item}</div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 font-mono text-xs leading-7 text-slate-500 sm:p-7">
              <div className="text-cyan-300">CTP ALPHA TERMINAL</div>
              <div className="mt-3">├── Market & News Sources</div>
              <div>├── Multi-chain Intelligence</div>
              <div>│   ├── Solana</div>
              <div>│   ├── Ethereum / L2</div>
              <div>│   └── EVM + emerging chains</div>
              <div>├── Express API</div>
              <div>├── Realtime Events</div>
              <div>├── BullMQ Workers</div>
              <div>├── PostgreSQL + Prisma</div>
              <div>├── Redis</div>
              <div>└── Next.js Research UI</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-24 lg:px-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/[.08] to-transparent p-8 sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">Multi-chain coverage</div>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Explore across ecosystems.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">Explorer links dan adapter dapat menjadi titik awal untuk forensic research lintas jaringan.</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {chains.map(chain => <span key={chain} className="rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400">{chain}</span>)}
              </div>
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-3xl border border-cyan-400/20 bg-cyan-400/5 text-cyan-300"><Globe2 size={32}/></div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-24 text-center lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">Ready when your research starts</div>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Build your next market thesis in one place.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-500">Gunakan CTP Alpha sebagai research terminal untuk mengorganisasi evidence, memantau perubahan, dan menjaga risk context tetap terlihat.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href={authenticated ? "/dashboard" : "/login"} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-7 py-3.5 text-sm font-black text-slate-950 hover:bg-cyan-200">{authenticated ? "Open Terminal" : "Enter Terminal"} <ArrowRight size={16}/></Link>
              <Link href="/dashboard/ai" className="rounded-xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/5">Explore AI Assistant</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 text-xs text-slate-600 sm:flex-row sm:items-end sm:justify-between lg:px-10">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-300"><div className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">α</div> CTP ALPHA TERMINAL</div>
            <p className="mt-3 max-w-md leading-5">Cyber Technology Project · Research infrastructure for crypto market and on-chain intelligence.</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex flex-wrap gap-4 sm:justify-end"><a href="#platform" className="hover:text-slate-300">Platform</a><a href="#workflow" className="hover:text-slate-300">Workflow</a><a href="#modules" className="hover:text-slate-300">Modules</a><Link href="/login" className="hover:text-slate-300">Sign in</Link></div>
            <div className="mt-3">© {new Date().getFullYear()} Cyber Technology Project. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;

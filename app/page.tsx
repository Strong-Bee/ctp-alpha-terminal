"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity, BrainCircuit, ChevronRight, CircleDollarSign, Cpu, Database,
  Gauge, Layers3, Menu, Radar, RefreshCw, ShieldCheck, Sparkles, WalletCards
} from "lucide-react";

type Summary = {
  alpha: { score: number; confidence: number; regime: string };
  modules: Record<string, string>;
};

const modules = [
  ["narrative", "Narratives", "Story & catalyst"],
  ["launches", "Launch Radar", "New token launches"],
  ["onchain", "On-chain", "Transaction intelligence"],
  ["wallets", "Wallet Intel", "Smart money tracking"],
  ["defi", "DeFi", "LP & yield risk"],
  ["risk", "Risk Engine", "Sizing & exposure"],
  ["orderFlow", "Order Flow", "Liquidity & structure"],
  ["macro", "Macro", "CPI / FOMC / rates"],
  ["cycles", "Cycle Timing", "Market cycle context"],
] as const;

const nav = [
  ["Overview", Gauge], ["Markets", Activity], ["Alpha Scanner", Radar],
  ["Wallet Intel", WalletCards], ["On-chain", Database], ["DeFi", Layers3], ["Risk", ShieldCheck],
] as const;

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [api, setApi] = useState("checking");
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [apiBase, setApiBase] = useState(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");
  const base = apiBase.replace(/\/$/, "");

  const load = async () => {
    try {
      const healthResponse = await fetch(base + "/health", { cache: "no-store" });
      const health = await healthResponse.json().catch(() => ({}));
      setApi(healthResponse.ok ? "online" : "error");
      const summaryResponse = await fetch(base + "/api/v1/dashboard/summary", { cache: "no-store" });
      if (summaryResponse.ok) setSummary(await summaryResponse.json());
    } catch (error) {
      setApi("offline");
      console.error("CTP API connection failed:", error);
    }
  };

  useEffect(() => {
    void load();
  }, [base]);

  async function askAi(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || loadingAi) return;
    setLoadingAi(true);
    setAnswer("");
    try {
      const response = await fetch(base + "/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: JSON.stringify(summary),
          reasoningEffort: "medium",
          maxTokens: 4096,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setAnswer(data.message ?? data.error ?? `NVIDIA AI error (HTTP ${response.status})`);
        return;
      }
      setAnswer(data.answer ?? "NVIDIA AI tidak mengembalikan jawaban.");
    } catch (error) {
      setAnswer(
        `Tidak dapat terhubung ke CTP API di ${base}. Pastikan Express API berjalan dan NEXT_PUBLIC_API_URL benar. ${error instanceof Error ? error.message : ""}`,
      );
    } finally {
      setLoadingAi(false);
    }
  }

  const score = summary?.alpha.score ?? 0;
  const confidence = summary?.alpha.confidence ?? 0;
  const activeModules = useMemo(() => Object.values(summary?.modules ?? {}).filter((v) => v === "ready").length, [summary]);

  return (
    <main className="min-h-screen bg-[#05070b]">
      <div className="flex min-h-screen">
        <aside className={`hidden border-r border-white/8 bg-[#080b11] lg:block ${sidebar ? "w-64" : "w-20"} transition-all`}>
          <div className="sticky top-0 flex h-screen flex-col p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-cyan-400 text-black"><BrainCircuit size={21}/></div>
              {sidebar && <div><div className="font-bold">CTP Alpha</div><div className="text-[10px] uppercase tracking-widest text-zinc-500">Terminal</div></div>}
            </div>
            <nav className="mt-8 space-y-1">
              {nav.map(([label, Icon]) => (
                <button key={label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${label === "Overview" ? "bg-white/8 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"}`}>
                  <Icon size={17}/>{sidebar && label}
                </button>
              ))}
            </nav>
            {sidebar && <div className="mt-auto rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300"><Cpu size={14}/> NVIDIA AI</div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Interpretation layer aktif. Analytics engine tetap menjadi sumber data.</p>
            </div>}
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/8 bg-[#05070b]/90 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-4 md:px-8">
              <div className="flex items-center gap-3 lg:hidden"><div className="grid size-8 place-items-center rounded-lg bg-cyan-400 text-black"><BrainCircuit size={17}/></div><span className="font-semibold">CTP Alpha</span></div>
              <button onClick={() => setSidebar(!sidebar)} className="hidden rounded-lg p-2 text-zinc-400 hover:bg-white/5 lg:block"><Menu size={18}/></button>
              <div className="ml-auto flex items-center gap-2">
                <span className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${api === "online" ? "border-emerald-500/20 text-emerald-400" : "border-red-500/20 text-red-400"}`}><span className="size-1.5 rounded-full bg-current"/>{api}</span>
                <button onClick={load} className="rounded-lg border border-white/8 p-2 text-zinc-400 hover:text-white"><RefreshCw size={16}/></button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-8">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">Dashboard <ChevronRight size={13}/> <span className="text-zinc-300">Overview</span></div>
              <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Alpha Overview</h1><p className="mt-1 text-sm text-zinc-500">Crypto intelligence command center.</p></div>
                <div className="text-xs text-zinc-500">Modules ready <span className="font-semibold text-zinc-200">{activeModules}/9</span></div>
              </div>
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              {[
                ["Alpha Score", score, "/ 100"],
                ["Confidence", confidence, "%"],
                ["Market Regime", summary?.alpha.regime ?? "NEUTRAL", ""],
              ].map(([title, value, suffix]) => (
                <div key={String(title)} className="rounded-2xl border border-white/8 bg-[#090d14] p-5">
                  <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-zinc-500">{title}</span><Sparkles size={15} className="text-cyan-400"/></div>
                  <div className="mt-5 flex items-end gap-2"><span className="text-4xl font-semibold">{value}</span><span className="mb-1 text-sm text-zinc-600">{suffix}</span></div>
                  {title === "Alpha Score" && <div className="mt-4 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-cyan-400" style={{width: `${score}%`}}/></div>}
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <div className="rounded-2xl border border-cyan-500/15 bg-[#090d14] p-5 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><BrainCircuit size={18}/></div><div><h2 className="font-semibold">NVIDIA Alpha AI</h2><p className="text-xs text-zinc-500">Evidence interpretation layer</p></div></div>
                  <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-cyan-300">NIM</span>
                </div>
                <form onSubmit={askAi} className="mt-5 flex flex-col gap-2">
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Contoh: analisis SOL berdasarkan market, wallet intel, liquidity dan risk..." className="resize-none rounded-xl border border-white/8 bg-[#05070b] p-4 text-sm outline-none placeholder:text-zinc-700 focus:border-cyan-400/40"/>
                  <div className="flex justify-end"><button disabled={loadingAi || !message.trim()} className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-40"><BrainCircuit size={15}/>{loadingAi ? "Analyzing..." : "Run Alpha Analysis"}</button></div>
                </form>
                {answer && <div className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-zinc-300">{answer}</div>}
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#090d14] p-5 md:p-6">
                <div className="flex items-center justify-between"><div><h2 className="font-semibold">System Health</h2><p className="text-xs text-zinc-500">Infrastructure status</p></div><Activity size={17} className="text-zinc-500"/></div>
                <div className="mt-5 space-y-3">
                  {[["API", api, "Express"],["AI", "NVIDIA NIM", "Inference"],["Queue", "BullMQ", "Worker"],["Cache", "Redis", "Realtime"]].map(([a,b,c]) => <div key={a} className="flex items-center justify-between rounded-xl border border-white/6 bg-black/10 p-3"><div><div className="text-sm">{a}</div><div className="text-[10px] text-zinc-600">{c}</div></div><span className="text-xs text-emerald-400">{b}</span></div>)}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between"><div><h2 className="font-semibold">Alpha Modules</h2><p className="text-xs text-zinc-500">Intelligence pipeline status</p></div><CircleDollarSign size={17} className="text-zinc-600"/></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map(([key, title, desc]) => {
                  const ready = summary?.modules[key] === "ready";
                  return <div key={key} className="group rounded-2xl border border-white/8 bg-[#090d14] p-4 hover:border-cyan-400/20">
                    <div className="flex items-start justify-between"><div><h3 className="text-sm font-medium">{title}</h3><p className="mt-1 text-xs text-zinc-600">{desc}</p></div><span className={`rounded-full px-2 py-1 text-[10px] ${ready ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-zinc-600"}`}>{summary?.modules[key] ?? "loading"}</span></div>
                    <div className="mt-4 h-1 rounded-full bg-white/5"><div className={`h-full rounded-full ${ready ? "w-full bg-emerald-400" : "w-1/4 bg-zinc-700"}`}/></div>
                  </div>;
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

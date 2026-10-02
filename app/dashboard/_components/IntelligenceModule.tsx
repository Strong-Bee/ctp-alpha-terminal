"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, BarChart3, Bell, CircleDollarSign, FileText, Gauge, LayoutDashboard, Menu, Moon, Network, Newspaper, Settings, ShieldAlert, Sparkles, Target, TrendingUp, Wallet, X } from "lucide-react";

type Props = { title: string; description: string; endpoint?: string };
const navigation = [
  ["Overview","/dashboard",LayoutDashboard],["Live News","/dashboard/live-news",Newspaper],["Markets","/dashboard/markets",BarChart3],
  ["Narratives","/dashboard/narratives",Sparkles],["Alpha Signals","/dashboard/alpha-signals",Target],["Launches","/dashboard/launches",TrendingUp],
  ["On-chain","/dashboard/on-chain",Network],["Wallet Intel","/dashboard/wallet-intel",Wallet],["DeFi","/dashboard/defi",CircleDollarSign],
  ["Risk Engine","/dashboard/risk-engine",ShieldAlert],["Order Flow","/dashboard/order-flow",Activity],["Macro","/dashboard/macro",Gauge],
  ["Cycles","/dashboard/cycles",Moon],["Thesis","/dashboard/thesis",FileText],["Alerts","/dashboard/alerts",Bell],
] as const;

export default function IntelligenceModule({ title, description, endpoint }: Props) {
  const [data, setData] = useState<unknown>(null);
  const [status, setStatus] = useState("LOADING");
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!endpoint) { setStatus("READY"); return; }
    fetch(endpoint).then(async (r) => {
      if (!r.ok) throw new Error("API error");
      setData(await r.json()); setStatus("LIVE");
    }).catch(() => setStatus("OFFLINE"));
  }, [endpoint]);

  return <main className="min-h-screen bg-[#05070b] text-white">
    {mobileOpen && <button aria-label="Close sidebar" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/10 bg-[#080b11] transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4"><Link href="/dashboard" className="font-bold">CTP <span className="text-cyan-300">ALPHA</span></Link><button className="lg:hidden" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <nav className="flex-1 overflow-y-auto p-3"><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Intelligence</div>{navigation.map(([label,href,Icon]) =>
        <Link key={label} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${title === label ? "bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17}/>{label}</Link>
      )}</nav>
      <Link href="/dashboard/settings" className="border-t border-white/10 p-4 text-sm text-slate-400 hover:text-white"><Settings size={17} className="mr-2 inline"/>Settings</Link>
    </aside>
    <div className="lg:pl-[260px]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070b]/90 px-4 py-3 backdrop-blur"><div className="flex items-center justify-between"><button className="rounded-lg border border-white/10 p-2 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><div className="text-sm font-semibold">{title}</div><span className={`text-xs ${status === "LIVE" ? "text-emerald-300" : "text-amber-300"}`}>● {status}</span></div></header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10">
        <Link href="/dashboard" className="text-xs text-cyan-300 hover:text-cyan-200">← Command Center</Link>
        <div className="mt-6 border-b border-white/10 pb-6"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">CTP Alpha Intelligence</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p></div>
        <section className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="text-xs text-slate-600">Data Source</div><div className="mt-2 font-semibold">{endpoint ?? "Terminal Core"}</div></div><div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="text-xs text-slate-600">Engine</div><div className="mt-2 font-semibold">CTP Alpha Intelligence</div></div><div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="text-xs text-slate-600">Update</div><div className="mt-2 font-semibold">Realtime / worker driven</div></div></section>
        <section className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-6"><h2 className="text-sm font-bold">Module Data</h2><pre className="mt-4 max-h-[600px] overflow-auto rounded-xl border border-white/5 bg-[#030508] p-4 text-xs leading-6 text-slate-400">{data ? JSON.stringify(data, null, 2) : "No module payload loaded yet."}</pre></section>
      </div>
    </div>
  </main>;
}

"use client";

import Link from "next/link";
import { Activity, BarChart3, Bell, BrainCircuit, ChevronLeft, ChevronRight, CircleDollarSign, FileText, Gauge, LayoutDashboard, Menu, Moon, Network, Newspaper, Settings, ShieldAlert, Sparkles, Target, TrendingUp, Wallet, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  ["Overview","/dashboard",LayoutDashboard],["Live News","/dashboard/live-news",Newspaper],["Markets","/dashboard/markets",BarChart3],
  ["Narratives","/dashboard/narratives",Sparkles],["Alpha Signals","/dashboard/alpha-signals",Target],["Launches","/dashboard/launches",TrendingUp],
  ["On-chain","/dashboard/on-chain",Network],["Wallet Intel","/dashboard/wallet-intel",Wallet],["DeFi","/dashboard/defi",CircleDollarSign],
  ["Risk Engine","/dashboard/risk-engine",ShieldAlert],["Order Flow","/dashboard/order-flow",Activity],["Macro","/dashboard/macro",Gauge],
  ["Cycles","/dashboard/cycles",Moon],["Thesis","/dashboard/thesis",FileText],["Alerts","/dashboard/alerts",Bell],
] as const;

export default function DashboardPage() {
 const [collapsed,setCollapsed]=useState(false); const [mobileOpen,setMobileOpen]=useState(false);
 return <main className="min-h-screen bg-[#05070b] text-white">
  {mobileOpen && <button aria-label="Close sidebar" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={()=>setMobileOpen(false)}/>}
  <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#080b11] transition-all ${collapsed?"w-[76px]":"w-[260px]"} ${mobileOpen?"translate-x-0":"-translate-x-full lg:translate-x-0"}`}>
   <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4"><Link href="/" className="flex items-center gap-2 font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300"><BrainCircuit size={18}/></span>{!collapsed&&<span>CTP <span className="text-cyan-300">ALPHA</span></span>}</Link><button className="lg:hidden" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
   <nav className="flex-1 overflow-y-auto p-3"><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Navigation</div><div className="space-y-1">
    {navigation.map(([label,href,Icon])=><Link key={label} href={href} onClick={()=>setMobileOpen(false)} title={collapsed?label:undefined} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"><Icon size={17}/>{!collapsed&&<span>{label}</span>}</Link>)}
   </div></nav>
   <div className="border-t border-white/10 p-3"><Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><Settings size={17}/>{!collapsed&&"Settings"}</Link><button onClick={()=>setCollapsed(v=>!v)} className="mt-1 hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-white/5 hover:text-white lg:flex">{collapsed?<ChevronRight size={17}/>:<ChevronLeft size={17}/>} {!collapsed&&"Collapse sidebar"}</button></div>
  </aside>
  <div className={collapsed?"lg:pl-[76px]":"lg:pl-[260px]"}><header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070b]/90 px-4 py-4 backdrop-blur"><div className="flex items-center gap-3"><button className="rounded-lg border border-white/10 p-2 lg:hidden" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><div className="text-sm font-semibold">Overview</div></div></header>
   <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">CTP Alpha Terminal</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Dashboard</h1><p className="mt-2 text-sm text-slate-500">Sidebar navigation is ready. Intelligence data modules have been cleared.</p><div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-slate-600">No module data loaded.</div></div>
  </div>
 </main>;
}

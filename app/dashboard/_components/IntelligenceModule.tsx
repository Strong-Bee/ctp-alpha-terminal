import Link from "next/link";
import { Activity, BarChart3, Bell, CircleDollarSign, FileText, Gauge, LayoutDashboard, Moon, Network, Newspaper, Settings, ShieldAlert, Sparkles, Target, TrendingUp, Wallet } from "lucide-react";

const navigation = [
  ["Overview","/dashboard",LayoutDashboard],["Live News","/dashboard/live-news",Newspaper],["Markets","/dashboard/markets",BarChart3],
  ["Narratives","/dashboard/narratives",Sparkles],["Alpha Signals","/dashboard/alpha-signals",Target],["Launches","/dashboard/launches",TrendingUp],
  ["On-chain","/dashboard/on-chain",Network],["Wallet Intel","/dashboard/wallet-intel",Wallet],["DeFi","/dashboard/defi",CircleDollarSign],
  ["Risk Engine","/dashboard/risk-engine",ShieldAlert],["Order Flow","/dashboard/order-flow",Activity],["Macro","/dashboard/macro",Gauge],
  ["Cycles","/dashboard/cycles",Moon],["Thesis","/dashboard/thesis",FileText],["Alerts","/dashboard/alerts",Bell],
] as const;

export default function IntelligenceModule({ title, description }: { title: string; description: string }) {
  return <main className="min-h-screen bg-[#05070b] text-white">
    <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-white/10 bg-[#080b11] lg:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-5"><Link href="/dashboard" className="font-bold">CTP <span className="text-cyan-300">ALPHA</span></Link></div>
      <nav className="flex-1 overflow-y-auto p-3"><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Intelligence</div>
        {navigation.map(([label,href,Icon]) => <Link key={label} href={href} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${title === label ? "bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17}/>{label}</Link>)}
      </nav>
      <Link href="/dashboard/settings" className="border-t border-white/10 p-4 text-sm text-slate-400 hover:text-white"><Settings size={17} className="mr-2 inline"/>Settings</Link>
    </aside>
    <div className="lg:pl-[260px]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070b]/90 px-4 py-4 backdrop-blur"><div className="text-sm font-semibold">{title}</div></header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10">
        <Link href="/dashboard" className="text-xs text-cyan-300 hover:text-cyan-200">← Command Center</Link>
        <div className="mt-6 border-b border-white/10 pb-6"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">CTP Alpha Terminal</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p></div>
        <section className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-12 text-center">
          <div className="text-sm font-semibold text-slate-400">Module data cleared</div>
          <p className="mt-2 text-xs text-slate-600">No market, news, DEX, on-chain, wallet, or other intelligence payload is displayed here.</p>
        </section>
      </div>
    </div>
  </main>;
}

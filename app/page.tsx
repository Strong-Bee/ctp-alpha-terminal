"use client";

import {useEffect,useState} from "react";

type Summary={alpha:{score:number;confidence:number;regime:string};modules:Record<string,string>};

const labels=["narrative","launches","onchain","wallets","defi","risk","orderFlow","macro","cycles"];

export default function Home(){
  const [summary,setSummary]=useState<Summary|null>(null);
  const [api,setApi]=useState("checking");
  useEffect(()=>{const base=process.env.NEXT_PUBLIC_API_URL??"http://localhost:4000"; fetch(base+"/health").then(r=>r.ok?setApi("online"):setApi("error")).catch(()=>setApi("offline")); fetch(base+"/api/v1/dashboard/summary").then(r=>r.json()).then(setSummary).catch(()=>{});},[]);
  return <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Cyber Technology Project</p><h1 className="mt-2 text-3xl font-bold md:text-5xl">CTP Alpha Terminal</h1><p className="mt-3 max-w-2xl text-zinc-400">Crypto alpha, on-chain intelligence, wallet analytics, DeFi risk and market structure in one terminal.</p></div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">API <span className="ml-2 font-semibold text-emerald-400">{api}</span></div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {[["Alpha Score",summary?.alpha.score??0],["Confidence",summary?.alpha.confidence??0],["Regime",summary?.alpha.regime??"NEUTRAL"]].map(([k,v])=><div key={String(k)} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><p className="text-sm text-zinc-500">{k}</p><p className="mt-2 text-3xl font-bold">{v}{k!=="Regime"&&"%"}</p></div>)}
      </section>
      <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Alpha Modules</h2><span className="text-xs text-zinc-500">MVP foundation</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{labels.map(key=><div key={key} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"><div className="flex items-center justify-between"><span className="capitalize">{key.replace(/([A-Z])/g," $1")}</span><span className="text-xs text-zinc-500">{summary?.modules[key]??"loading"}</span></div><div className="mt-3 h-1.5 rounded-full bg-zinc-800"><div className="h-1.5 w-1/4 rounded-full bg-cyan-500"/></div></div>)}</div></section>
    </div>
  </main>;
}
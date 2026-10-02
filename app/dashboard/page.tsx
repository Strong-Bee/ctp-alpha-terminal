"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
type Summary={generatedAt:string;alpha:{score:number;confidence:number;regime:string};modules:Record<string,string>};
export default function DashboardPage(){
 const [s,setS]=useState<Summary|null>(null);const[status,setStatus]=useState("CONNECTING");
 useEffect(()=>{fetch("/api/v1/dashboard/summary").then(r=>r.ok?r.json():Promise.reject()).then(d=>{setS(d);setStatus("ONLINE")}).catch(()=>setStatus("OFFLINE"))},[]);
 const modules=s?.modules??{narrative:"ready",launches:"planned",onchain:"planned",wallets:"planned",defi:"planned",risk:"ready",orderFlow:"planned",macro:"planned",cycles:"planned"};
 return <main className="min-h-screen bg-[#05070b] text-white"><header className="sticky top-0 z-10 border-b border-white/10 bg-[#05070b]/90 px-6 py-4 backdrop-blur"><div className="mx-auto flex max-w-[1500px] justify-between"><Link href="/" className="font-bold">CTP <span className="text-cyan-300">ALPHA</span></Link><span className="text-xs text-slate-500">● {status}</span></div></header>
 <div className="mx-auto max-w-[1500px] p-6 lg:p-10"><p className="text-xs uppercase tracking-[.3em] text-cyan-300">Command Center</p><h1 className="mt-2 text-4xl font-black">Alpha Dashboard</h1><p className="mt-2 text-slate-500">Market intelligence, on-chain signals, and risk context.</p>
 <section className="mt-8 grid gap-4 md:grid-cols-3">{[["Alpha Score",s?.alpha.score??0,"/100"],["Confidence",s?.alpha.confidence??0,"%"],["Market Regime",s?.alpha.regime??"NEUTRAL",""]].map(([a,b,c])=><div key={a} className="rounded-2xl border border-white/10 bg-white/[.025] p-6"><div className="text-sm text-slate-500">{a}</div><div className="mt-3 text-4xl font-black">{b}<span className="ml-1 text-lg text-slate-600">{c}</span></div></div>)}</section>
 <section className="mt-6 grid gap-4 lg:grid-cols-3">{Object.entries(modules).map(([name,state])=><div key={name} className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="flex justify-between"><span className="font-semibold capitalize">{name.replace(/([A-Z])/g," $1")}</span><span className={state==="ready"?"text-xs text-emerald-300":"text-xs text-amber-300"}>{state}</span></div><div className="mt-5 h-1.5 rounded-full bg-white/10"><div className={state==="ready"?"h-full w-full rounded-full bg-emerald-400":"h-full w-1/3 rounded-full bg-amber-400"}/></div></div>)}</section>
 </div></main>;
}
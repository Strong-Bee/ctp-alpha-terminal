"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  title: string;
  description: string;
  endpoint?: string;
};

export default function IntelligenceModule({ title, description, endpoint }: Props) {
  const [data, setData] = useState<unknown>(null);
  const [status, setStatus] = useState("LOADING");

  useEffect(() => {
    if (!endpoint) { setStatus("READY"); return; }
    fetch(endpoint).then(async (r) => {
      if (!r.ok) throw new Error("API error");
      setData(await r.json());
      setStatus("LIVE");
    }).catch(() => setStatus("OFFLINE"));
  }, [endpoint]);

  return (
    <main className="min-h-screen bg-[#05070b] p-4 text-white sm:p-6 lg:p-10">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/dashboard" className="text-xs text-cyan-300 hover:text-cyan-200">← Back to Command Center</Link>
        <div className="mt-6 flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300">CTP Alpha Intelligence</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${status === "LIVE" ? "border-emerald-400/20 text-emerald-300" : status === "OFFLINE" ? "border-red-400/20 text-red-300" : "border-amber-400/20 text-amber-300"}`}>{status}</span>
        </div>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="text-xs text-slate-600">Data Source</div><div className="mt-2 font-semibold">{endpoint ?? "Terminal Core"}</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="text-xs text-slate-600">Engine</div><div className="mt-2 font-semibold">CTP Alpha Intelligence</div></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="text-xs text-slate-600">Update</div><div className="mt-2 font-semibold">Realtime / worker driven</div></div>
        </section>
        <section className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-6">
          <h2 className="text-sm font-bold">Module Data</h2>
          <pre className="mt-4 max-h-[600px] overflow-auto rounded-xl border border-white/5 bg-[#030508] p-4 text-xs leading-6 text-slate-400">{data ? JSON.stringify(data, null, 2) : "No module payload loaded yet. Connect the module API to populate this view."}</pre>
        </section>
      </div>
    </main>
  );
}

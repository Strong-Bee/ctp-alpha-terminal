"use client";

import { FormEvent, useEffect, useState } from "react";

type Summary = {
  alpha: { score: number; confidence: number; regime: string };
  modules: Record<string, string>;
};

const labels = ["narrative", "launches", "onchain", "wallets", "defi", "risk", "orderFlow", "macro", "cycles"];

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [api, setApi] = useState("checking");
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    fetch(base + "/health")
      .then((r) => (r.ok ? setApi("online") : setApi("error")))
      .catch(() => setApi("offline"));

    fetch(base + "/api/v1/dashboard/summary")
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});
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
        }),
      });
      const data = await response.json();
      setAnswer(response.ok ? data.answer : data.message ?? data.error ?? "AI request failed");
    } catch {
      setAnswer("Tidak dapat terhubung ke NVIDIA AI.");
    } finally {
      setLoadingAi(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Cyber Technology Project</p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">CTP Alpha Terminal</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">Crypto alpha, on-chain intelligence, wallet analytics, DeFi risk and market structure in one terminal.</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm">
            API <span className="ml-2 font-semibold text-emerald-400">{api}</span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["Alpha Score", summary?.alpha.score ?? 0],
            ["Confidence", summary?.alpha.confidence ?? 0],
            ["Regime", summary?.alpha.regime ?? "NEUTRAL"],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-500">{k}</p>
              <p className="mt-2 text-3xl font-bold">{v}{k !== "Regime" && "%"}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-cyan-900/50 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">NVIDIA Alpha AI</h2>
              <p className="text-sm text-zinc-500">AI interpretation layer for market and on-chain intelligence.</p>
            </div>
            <span className="rounded-full border border-cyan-800 px-3 py-1 text-xs text-cyan-400">NVIDIA NIM</span>
          </div>
          <form onSubmit={askAi} className="flex flex-col gap-3 md:flex-row">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contoh: analisis kondisi alpha terminal saat ini..."
              className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loadingAi || !message.trim()}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAi ? "Analyzing..." : "Ask NVIDIA AI"}
            </button>
          </form>
          {answer && (
            <div className="mt-4 whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm leading-6 text-zinc-300">
              {answer}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Alpha Modules</h2>
            <span className="text-xs text-zinc-500">MVP foundation</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {labels.map((key) => (
              <div key={key} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="text-xs text-zinc-500">{summary?.modules[key] ?? "loading"}</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-zinc-800">
                  <div className="h-1.5 w-1/4 rounded-full bg-cyan-500" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

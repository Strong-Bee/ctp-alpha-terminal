import Link from "next/link";

const features = [
  ["01", "Narrative Alpha", "Detect market narratives, catalysts, and emerging themes before they become crowded."],
  ["02", "On-chain Intelligence", "Trace deployers, smart money, whale flows, CEX movements, and liquidity behavior."],
  ["03", "Risk Engine", "Turn market evidence into structured sizing, invalidation, and portfolio risk decisions."],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.16),transparent_36%)]" />
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 font-black text-cyan-300">α</div>
            <div>
              <div className="font-bold tracking-tight">CTP ALPHA</div>
              <div className="text-[10px] uppercase tracking-[.3em] text-slate-500">Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-white/5 md:block">Dashboard</Link>
            <Link href="/login" className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20">Sign in</Link>
          </div>
        </nav>

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:pb-32 lg:pt-28">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-medium text-cyan-300">ON-CHAIN INTELLIGENCE PLATFORM</div>
            <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-[-.04em] sm:text-6xl lg:text-8xl">
              Find the signal.
              <span className="block text-cyan-300">Before the crowd.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              CTP Alpha Terminal unifies narratives, on-chain forensics, wallet intelligence, DeFi, order flow, macro cycles, and risk into one research workspace.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-xl bg-cyan-300 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-200">Enter Terminal</Link>
              <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10">View Dashboard</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-[#080b11] p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-widest text-slate-500">Alpha Monitor</span>
                <span className="flex items-center gap-2 text-xs text-emerald-300"><i className="h-2 w-2 rounded-full bg-emerald-400" />LIVE</span>
              </div>
              <div className="py-8">
                <div className="text-sm text-slate-500">Composite Alpha Score</div>
                <div className="mt-2 text-7xl font-black tracking-tight">87<span className="text-2xl text-slate-600">/100</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[87%] rounded-full bg-cyan-300" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Narrative 92", "On-chain 88", "Smart Money 84", "Risk 79"].map((x) => <div key={x} className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm text-slate-300">{x}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(([n, title, text]) => (
            <div key={n} className="rounded-2xl border border-white/10 bg-white/[.025] p-7">
              <div className="text-xs font-bold text-cyan-300">{n}</div>
              <h2 className="mt-8 text-xl font-bold">{title}</h2>
              <p className="mt-3 leading-7 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-slate-600">© {new Date().getFullYear()} Cyber Technology Project · CTP Alpha Terminal</footer>
    </main>
  );
}

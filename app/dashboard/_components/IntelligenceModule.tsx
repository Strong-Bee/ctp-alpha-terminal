import Link from "next/link";
import {
  Activity, BarChart3, Bell, BrainCircuit, CircleDollarSign, FileText, Gauge,
  LayoutDashboard, Moon, Network, Newspaper, Settings, ShieldAlert, Sparkles,
  Target, TrendingUp, Wallet, Search, SlidersHorizontal, ArrowUpRight
} from "lucide-react";

type ModuleKey =
  | "overview" | "live-news" | "markets" | "narratives" | "alpha-signals" | "launches"
  | "on-chain" | "wallet-intel" | "defi" | "risk-engine" | "order-flow" | "macro"
  | "cycles" | "thesis" | "alerts" | "settings";

const navigation = [
  ["Overview","/dashboard",LayoutDashboard,"overview"],
  ["Live News","/dashboard/live-news",Newspaper,"live-news"],
  ["Markets","/dashboard/markets",BarChart3,"markets"],
  ["Narratives","/dashboard/narratives",Sparkles,"narratives"],
  ["Alpha Signals","/dashboard/alpha-signals",Target,"alpha-signals"],
  ["Launches","/dashboard/launches",TrendingUp,"launches"],
  ["On-chain","/dashboard/on-chain",Network,"on-chain"],
  ["Wallet Intel","/dashboard/wallet-intel",Wallet,"wallet-intel"],
  ["DeFi","/dashboard/defi",CircleDollarSign,"defi"],
  ["Risk Engine","/dashboard/risk-engine",ShieldAlert,"risk-engine"],
  ["Order Flow","/dashboard/order-flow",Activity,"order-flow"],
  ["Macro","/dashboard/macro",Gauge,"macro"],
  ["Cycles","/dashboard/cycles",Moon,"cycles"],
  ["Thesis","/dashboard/thesis",FileText,"thesis"],
  ["Alerts","/dashboard/alerts",Bell,"alerts"],
] as const;

const content: Record<ModuleKey, {
  eyebrow: string;
  title: string;
  description: string;
  kpis: string[];
  sections: { title: string; description: string; items: string[] }[];
}> = {
  overview: {
    eyebrow: "Command Center", title: "Overview",
    description: "Pusat kendali CTP Alpha Terminal untuk menggabungkan market, narrative, on-chain intelligence, risk, dan thesis.",
    kpis: ["Alpha Score", "Market Regime", "Active Signals", "Risk Exposure"],
    sections: [
      { title: "Alpha Pipeline", description: "Alur intelligence dari discovery sampai decision.", items: ["Narrative discovery", "On-chain validation", "Smart-money confirmation", "Liquidity & momentum", "Risk validation"] },
      { title: "Market State", description: "Panel yang akan menampilkan kondisi pasar lintas aset.", items: ["BTC / ETH / SOL", "Volume & liquidity", "Volatility", "Market breadth", "Macro context"] },
      { title: "Decision Queue", description: "Watchlist, thesis dan alert yang membutuhkan perhatian.", items: ["Signals awaiting validation", "Thesis invalidation", "Liquidity events", "Wallet activity"] },
    ],
  },
  "live-news": {
    eyebrow: "Information Flow", title: "Live News",
    description: "Feed berita crypto untuk mendeteksi catalyst, narrative shift, dan risiko informasi.",
    kpis: ["Latest Stories", "Narratives", "Catalysts", "Risk Mentions"],
    sections: [
      { title: "Latest Feed", description: "Berita terbaru berdasarkan source dan timestamp.", items: ["Source", "Published time", "Headline", "Asset / narrative", "Link"] },
      { title: "News Intelligence", description: "Klasifikasi berita sebelum masuk ke Alpha Engine.", items: ["Bullish / bearish / neutral", "Catalyst detection", "Narrative extraction", "Duplicate filtering"] },
      { title: "Source Monitor", description: "Pemantauan sumber berita dan kualitas feed.", items: ["CoinDesk", "Cointelegraph", "Decrypt", "CryptoSlate", "Other configured feeds"] },
    ],
  },
  markets: {
    eyebrow: "Market Intelligence", title: "Markets",
    description: "Market terminal untuk price discovery, liquidity, volume, momentum, dan pair intelligence.",
    kpis: ["Watchlist", "Top Volume", "Gainers", "Losers"],
    sections: [
      { title: "Market Scanner", description: "Screening aset berdasarkan kondisi pasar.", items: ["Price", "24h change", "Volume", "Liquidity", "Market cap"] },
      { title: "Pair Intelligence", description: "Detail pair dan DEX liquidity.", items: ["Chain", "DEX", "Pair", "Liquidity", "Price impact"] },
      { title: "Momentum", description: "Deteksi perubahan aktivitas pasar.", items: ["Volume acceleration", "Liquidity change", "Price momentum", "Volatility expansion"] },
    ],
  },
  narratives: {
    eyebrow: "Narrative Intelligence", title: "Narratives",
    description: "Memetakan tema pasar yang sedang berkembang dan menghubungkannya dengan catalyst serta aset.",
    kpis: ["Active Narratives", "Emerging", "Catalysts", "Assets"],
    sections: [
      { title: "Narrative Radar", description: "Tema yang sedang mengalami perubahan perhatian.", items: ["AI", "DeFi", "Memecoins", "RWA", "Infrastructure"] },
      { title: "Narrative Lifecycle", description: "Tahapan narrative dari emergence sampai exhaustion.", items: ["Emerging", "Expansion", "Mainstream", "Distribution", "Exhaustion"] },
      { title: "Catalyst Map", description: "Hubungan catalyst → narrative → asset.", items: ["Event", "Source", "Affected assets", "Expected timeframe"] },
    ],
  },
  "alpha-signals": {
    eyebrow: "Signal Engine", title: "Alpha Signals",
    description: "Signal workspace yang menggabungkan narrative, on-chain, smart money, liquidity, momentum, catalyst, dan risk.",
    kpis: ["Signal Score", "Confidence", "Long", "Short"],
    sections: [
      { title: "Signal Queue", description: "Daftar signal yang menunggu validasi.", items: ["LONG / SHORT / WATCH", "Alpha Score", "Confidence", "Entry zone", "Invalidation"] },
      { title: "Signal Factors", description: "Komponen pembentuk signal.", items: ["Narrative", "On-chain", "Smart money", "Liquidity", "Momentum", "Catalyst", "Risk"] },
      { title: "Execution Plan", description: "Rencana entry dan invalidation yang terpisah dari opini AI.", items: ["Entry", "Stop loss", "TP1 / TP2 / TP3", "Risk / reward"] },
    ],
  },
  launches: {
    eyebrow: "Launch Intelligence", title: "Launches",
    description: "Monitoring token/pair baru dan aktivitas launch untuk menemukan perubahan liquidity serta early activity.",
    kpis: ["New Tokens", "New Pairs", "Liquidity Events", "Boost Activity"],
    sections: [
      { title: "New Launch Radar", description: "Token dan pair baru yang masuk ke radar.", items: ["Token", "Chain", "DEX", "Pair", "Created time"] },
      { title: "Launch Risk", description: "Checklist risiko sebelum token masuk watchlist.", items: ["Deployer", "Liquidity", "Holder concentration", "Trading activity", "Contract checks"] },
      { title: "Promotion Signals", description: "Aktivitas boost, ads, dan community takeover.", items: ["Boost", "Ads", "Community takeover", "Social profile"] },
    ],
  },
  "on-chain": {
    eyebrow: "On-chain Forensics", title: "On-chain",
    description: "Forensik transaksi, deployer, holder, liquidity flow, dan aktivitas wallet pada aset yang dipantau.",
    kpis: ["Transactions", "Whale Flow", "CEX Flow", "Liquidity Flow"],
    sections: [
      { title: "Transaction Flow", description: "Aktivitas blockchain yang relevan dengan asset.", items: ["Transfers", "Swaps", "Liquidity", "Large transactions"] },
      { title: "Wallet Forensics", description: "Membaca hubungan antar wallet dan sumber dana.", items: ["Deployer wallet", "Funding wallet", "CEX destination", "Wallet clusters"] },
      { title: "Manipulation Checks", description: "Indikator untuk mendeteksi aktivitas yang tidak organik.", items: ["Wash trading", "Volume anomalies", "Holder concentration", "Liquidity withdrawal"] },
    ],
  },
  "wallet-intel": {
    eyebrow: "Wallet Intelligence", title: "Wallet Intel",
    description: "Tracking smart money, whale, deployer, dan CEX wallet dengan filter noise.",
    kpis: ["Tracked Wallets", "Smart Money", "Whales", "Alerts"],
    sections: [
      { title: "Wallet Registry", description: "Daftar wallet berdasarkan tipe dan chain.", items: ["Smart money", "Whale", "Deployer", "CEX", "Unknown"] },
      { title: "Wallet Activity", description: "Aktivitas wallet yang menghasilkan signal.", items: ["Buy", "Sell", "Transfer", "New position", "Exit"] },
      { title: "Trade Thesis", description: "Alasan sebuah wallet activity dianggap relevan.", items: ["Entry behavior", "Position size", "Historical hit rate", "Cluster confirmation"] },
    ],
  },
  defi: {
    eyebrow: "DeFi Intelligence", title: "DeFi",
    description: "Workspace untuk LP, yield, staking, funding/basis, dan risiko posisi DeFi.",
    kpis: ["TVL", "Pools", "Yield", "Fees"],
    sections: [
      { title: "Pool Monitor", description: "Monitoring pool dan perubahan liquidity.", items: ["TVL", "Liquidity", "Volume", "Fees", "APR / APY"] },
      { title: "LP Risk", description: "Evaluasi risiko posisi liquidity provider.", items: ["Impermanent loss", "Volatility", "Pool depth", "Smart contract risk"] },
      { title: "Yield Opportunities", description: "Perbandingan sumber yield yang dapat dipantau.", items: ["LP", "Staking", "Lending", "Funding", "Basis"] },
    ],
  },
  "risk-engine": {
    eyebrow: "Risk Management", title: "Risk Engine",
    description: "Mengubah setup trading menjadi parameter risiko yang terukur sebelum eksekusi.",
    kpis: ["Portfolio Risk", "Position Size", "R:R", "Exposure"],
    sections: [
      { title: "Position Sizing", description: "Kalkulasi ukuran posisi berdasarkan modal dan stop.", items: ["Account equity", "Risk per trade", "Entry", "Stop loss", "Position size"] },
      { title: "Portfolio Exposure", description: "Melihat konsentrasi risiko antar posisi.", items: ["Asset exposure", "Chain exposure", "Sector exposure", "Correlation"] },
      { title: "Risk Controls", description: "Guardrail sebelum signal dapat dieksekusi.", items: ["Max loss", "Max leverage", "Liquidity threshold", "Invalidation"] },
    ],
  },
  "order-flow": {
    eyebrow: "Institutional Order Flow", title: "Order Flow",
    description: "Analisis volume dan level institusional untuk membaca auction dan liquidity behavior.",
    kpis: ["Volume", "VWAP", "Imbalance", "Profile"],
    sections: [
      { title: "Auction Market", description: "Struktur volume berdasarkan harga.", items: ["Volume profile", "POC", "Value area", "High / low volume nodes"] },
      { title: "Institutional Levels", description: "Level yang menjadi referensi eksekusi.", items: ["VWAP", "Anchored VWAP", "Session levels", "Key liquidity"] },
      { title: "Flow Imbalance", description: "Perubahan tekanan buyer/seller.", items: ["Buy pressure", "Sell pressure", "Delta", "Absorption"] },
    ],
  },
  macro: {
    eyebrow: "Macro Intelligence", title: "Macro",
    description: "Kalender dan konteks makro yang dapat mempengaruhi risk assets dan crypto liquidity.",
    kpis: ["Events", "CPI", "FOMC", "DXY"],
    sections: [
      { title: "Macro Calendar", description: "Event ekonomi yang relevan untuk market.", items: ["CPI", "FOMC", "PPI", "NFP", "GDP"] },
      { title: "Liquidity Context", description: "Konteks kondisi likuiditas global.", items: ["Rates", "DXY", "Treasury yields", "Liquidity"] },
      { title: "Event Risk", description: "Checklist sebelum market event besar.", items: ["Pre-event volatility", "Consensus", "Actual", "Reaction", "False breakout"] },
    ],
  },
  cycles: {
    eyebrow: "Cycle Timing", title: "Cycles",
    description: "Kerangka waktu untuk market cycle, halving, Wyckoff, dan seasonal context.",
    kpis: ["Cycle Phase", "Halving", "Wyckoff", "Seasonality"],
    sections: [
      { title: "Market Cycle", description: "Konteks fase market yang sedang berjalan.", items: ["Accumulation", "Markup", "Distribution", "Markdown"] },
      { title: "Bitcoin Cycle", description: "Timeline berbasis halving dan market structure.", items: ["Halving", "Post-halving", "Cycle highs", "Cycle lows"] },
      { title: "Timing Context", description: "Contextual timing, bukan sinyal mandiri.", items: ["Wyckoff", "Moon phases", "Seasonality", "Macro event timing"] },
    ],
  },
  thesis: {
    eyebrow: "Research Workspace", title: "Thesis",
    description: "Tempat menyusun thesis trading/investment lengkap dengan evidence, catalyst, target, dan invalidation.",
    kpis: ["Open Thesis", "Validated", "Invalidated", "Watchlist"],
    sections: [
      { title: "Thesis Builder", description: "Struktur thesis yang dapat diuji.", items: ["Setup", "Catalyst", "Evidence", "Entry", "Target", "Invalidation"] },
      { title: "Evidence", description: "Bukti yang mendukung atau melemahkan thesis.", items: ["Market data", "On-chain", "Wallet", "Macro", "News"] },
      { title: "Review Journal", description: "Evaluasi thesis setelah market bergerak.", items: ["What changed", "What was correct", "What failed", "Next action"] },
    ],
  },
  alerts: {
    eyebrow: "Alert Center", title: "Alerts",
    description: "Pusat notifikasi untuk perubahan market, wallet, liquidity, news, macro, dan risk.",
    kpis: ["Active Alerts", "Triggered", "Critical", "Muted"],
    sections: [
      { title: "Alert Rules", description: "Aturan yang dapat dibuat berdasarkan event.", items: ["Price", "Volume", "Liquidity", "Wallet", "News", "Macro"] },
      { title: "Triggered Alerts", description: "Event yang sudah melewati kondisi alert.", items: ["Timestamp", "Asset", "Condition", "Severity", "Action"] },
      { title: "Delivery", description: "Channel pengiriman notifikasi.", items: ["In-app", "Telegram", "WhatsApp", "Webhook"] },
    ],
  },
  settings: {
    eyebrow: "System", title: "Settings",
    description: "Konfigurasi data source, refresh interval, AI provider, notification, dan system preferences.",
    kpis: ["API Status", "Data Sources", "AI Provider", "Notifications"],
    sections: [
      { title: "Data Sources", description: "Konfigurasi sumber intelligence.", items: ["DEX Screener", "News feeds", "On-chain RPC", "Market data"] },
      { title: "AI Configuration", description: "AI digunakan sebagai interpretation layer.", items: ["NVIDIA API", "Model", "Reasoning mode", "Timeout"] },
      { title: "System", description: "Preferensi aplikasi.", items: ["Refresh interval", "Timezone", "Theme", "Notification channels"] },
    ],
  },
};

function ModuleBody({ module }: { module: ModuleKey }) {
  const data = content[module];
  return <>
    <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {data.kpis.map((label) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-white/[.025] p-5">
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-600">{label}</div>
          <div className="mt-4 text-sm text-slate-500">Awaiting data feed</div>
        </div>
      ))}
    </div>
    <div className="mt-6 grid gap-5 xl:grid-cols-3">
      {data.sections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-white/10 bg-[#080b11] p-5">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="font-semibold">{section.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{section.description}</p></div>
            <ArrowUpRight size={16} className="text-slate-600" />
          </div>
          <div className="mt-5 space-y-2">
            {section.items.map((item) => <div key={item} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[.02] px-3 py-2.5 text-xs"><span className="text-slate-400">{item}</span><span className="text-slate-700">—</span></div>)}
          </div>
        </section>
      ))}
    </div>
  </>;
}

export default function IntelligenceModule({ module }: { module: ModuleKey }) {
  const data = content[module];
  return <main className="min-h-screen bg-[#05070b] text-white">
    <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-white/10 bg-[#080b11] lg:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-5"><Link href="/dashboard" className="flex items-center gap-2 font-bold"><BrainCircuit size={18} className="text-cyan-300"/>CTP <span className="text-cyan-300">ALPHA</span></Link></div>
      <nav className="flex-1 overflow-y-auto p-3"><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-slate-600">Intelligence</div>
        {navigation.map(([label,href,Icon,key]) => <Link key={label} href={href} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${module === key ? "bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17}/>{label}</Link>)}
      </nav>
      <Link href="/dashboard/settings" className="border-t border-white/10 p-4 text-sm text-slate-400 hover:text-white"><Settings size={17} className="mr-2 inline"/>Settings</Link>
    </aside>
    <div className="lg:pl-[260px]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070b]/90 px-4 py-4 backdrop-blur"><div className="flex items-center justify-between"><div className="text-sm font-semibold">{data.title}</div><div className="flex items-center gap-2 text-xs text-slate-600"><Search size={14}/>Search <SlidersHorizontal size={14}/></div></div></header>
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-10">
        <Link href="/dashboard" className="text-xs text-cyan-300 hover:text-cyan-200">← Command Center</Link>
        <div className="mt-6 border-b border-white/10 pb-6"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-cyan-300">{data.eyebrow}</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{data.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{data.description}</p></div>
        <ModuleBody module={module}/>
      </div>
    </div>
  </main>;
}

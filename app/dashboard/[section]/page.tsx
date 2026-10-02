import IntelligenceModule from "../_components/IntelligenceModule";

const modules: Record<string, { title: string; description: string; endpoint?: string }> = {
  "alpha-signals": { title: "Alpha Signals", description: "Structured alpha signals combining narrative, market, on-chain, and risk evidence." },
  launches: { title: "Launches", description: "Monitor new token launches, profile activity, boosts, and early market formation.", endpoint: "/api/v1/dex/token-profiles/latest" },
  "on-chain": { title: "On-chain", description: "Analyze token and pair activity, transactions, liquidity, and DEX market structure." },
  "wallet-intel": { title: "Wallet Intel", description: "Smart-money, whale, deployer, CEX flow, and wallet behavior intelligence." },
  defi: { title: "DeFi", description: "DEX, liquidity, yield, pool, and decentralized finance intelligence." },
  "risk-engine": { title: "Risk Engine", description: "Position sizing, invalidation, liquidity risk, volatility, and portfolio controls." },
  "order-flow": { title: "Order Flow", description: "Institutional order-flow context, VWAP, volume profile, and execution structure." },
  macro: { title: "Macro", description: "Macro catalysts including CPI, FOMC, rates, liquidity, and risk regime context." },
  cycles: { title: "Cycles", description: "Cycle timing, market phases, halving context, and recurring market structure." },
  thesis: { title: "Thesis", description: "Create and monitor structured trade and investment theses with evidence and invalidation." },
  alerts: { title: "Alerts", description: "Central alert center for market, news, on-chain, wallet, and risk events." },
  settings: { title: "Settings", description: "Terminal configuration, data sources, refresh intervals, and system preferences." },
};

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const module = modules[section] ?? { title: section.replaceAll("-", " "), description: "CTP Alpha Terminal intelligence module." };
  return <IntelligenceModule title={module.title} description={module.description} endpoint={module.endpoint} />;
}

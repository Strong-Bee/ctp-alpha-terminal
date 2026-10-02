import IntelligenceModule from "../_components/IntelligenceModule";

const modules: Record<string, { title: string; description: string }> = {
 "alpha-signals": { title: "Alpha Signals", description: "Alpha signals module." }, launches: { title: "Launches", description: "Token launches module." },
 "on-chain": { title: "On-chain", description: "On-chain module." }, "wallet-intel": { title: "Wallet Intel", description: "Wallet intelligence module." },
 defi: { title: "DeFi", description: "DeFi module." }, "risk-engine": { title: "Risk Engine", description: "Risk module." },
 "order-flow": { title: "Order Flow", description: "Order flow module." }, macro: { title: "Macro", description: "Macro module." },
 cycles: { title: "Cycles", description: "Cycles module." }, thesis: { title: "Thesis", description: "Thesis module." },
 alerts: { title: "Alerts", description: "Alerts module." }, settings: { title: "Settings", description: "Settings module." }
};
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
 const { section } = await params; const module = modules[section] ?? { title: section.replaceAll("-", " "), description: "CTP Alpha Terminal module." };
 return <IntelligenceModule title={module.title} description={module.description} />;
}

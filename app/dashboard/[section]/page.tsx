import IntelligenceModule from "../_components/IntelligenceModule";

const allowed = new Set([
  "alpha-signals","launches","on-chain","wallet-intel","defi","risk-engine",
  "order-flow","macro","cycles","thesis","alerts","settings"
]);

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const module = allowed.has(section) ? section as Parameters<typeof IntelligenceModule>[0]["module"] : "overview";
  return <IntelligenceModule module={module} />;
}

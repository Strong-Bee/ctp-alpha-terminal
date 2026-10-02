import IntelligenceModule from "../_components/IntelligenceModule";
export default function Page() {
  return <IntelligenceModule title="Markets" description="Market overview, liquidity context, movers, and price monitoring." endpoint="/api/v1/news" />;
}

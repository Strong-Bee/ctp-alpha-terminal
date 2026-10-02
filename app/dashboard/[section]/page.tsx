import { auth } from "@/auth";
import { redirect } from "next/navigation";
import IntelligenceModule from "../_components/IntelligenceModule";

const allowed = new Set([
  "ai","alpha-signals","launches","on-chain","wallet-intel","defi","risk-engine",
  "order-flow","macro","cycles","thesis","alerts","settings"
]);

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { section } = await params;
  const module = allowed.has(section) ? section as Parameters<typeof IntelligenceModule>[0]["module"] : "overview";
  return <IntelligenceModule module={module} />;
}

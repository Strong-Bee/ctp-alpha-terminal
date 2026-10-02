import { auth } from "@/auth";
import { redirect } from "next/navigation";
import IntelligenceModule from "./_components/IntelligenceModule";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <IntelligenceModule module="overview" />;
}

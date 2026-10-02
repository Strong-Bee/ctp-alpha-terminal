import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ModelItem = { id: string; name?: string; owned_by?: string; context_length?: number };

export async function POST(request: Request) {
  const session = await auth();
  const userEmail = session?.user?.email?.trim().toLowerCase();
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json().catch(() => ({}))) as {
      provider?: string; baseUrl?: string; apiKey?: string;
    };
    const saved = await prisma.userAISettings.findUnique({ where: { userEmail } });
    const baseUrl = String(body.baseUrl || saved?.baseUrl || process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").trim().replace(/\/$/, "");
    const apiKey = String(body.apiKey || "").trim() || (saved?.apiKeyEncrypted ? decryptSecret(saved.apiKeyEncrypted) : process.env.NVIDIA_API_KEY);

    if (!/^https:\/\//i.test(baseUrl)) return NextResponse.json({ error: "Base URL harus menggunakan HTTPS" }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "API key belum tersedia" }, { status: 400 });

    const headers: Record<string,string> = { Accept: "application/json", Authorization: "Bearer " + apiKey };
    if (String(body.provider || saved?.provider || "").toLowerCase() === "openrouter") {
      headers["HTTP-Referer"] = "https://cybertechnologyproject.my.id";
      headers["X-Title"] = "CTP Alpha Terminal";
    }

    const response = await fetch(baseUrl + "/models", {
      headers, cache: "no-store", signal: AbortSignal.timeout(20_000),
    });
    const raw = await response.text();
    let data: { data?: ModelItem[]; error?: { message?: string } };
    try { data = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "Provider mengembalikan response model bukan JSON" }, { status: 502 }); }
    if (!response.ok) return NextResponse.json({ error: data.error?.message || raw.slice(0,500) || "Gagal mengambil daftar model" }, { status: 502 });

    const list = Array.isArray(data.data) ? data.data
      .filter(x => x && typeof x.id === "string" && x.id.trim())
      .map(x => ({ id:x.id, name:x.name || x.id, ownedBy:x.owned_by || null, contextLength:x.context_length || null }))
      .sort((a,b)=>a.id.localeCompare(b.id)) : [];

    return NextResponse.json({ ok:true, provider:String(body.provider || saved?.provider || "nvidia"), baseUrl, models:list, count:list.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load models";
    return NextResponse.json({ error: message.toLowerCase().includes("timeout") ? "Request daftar model timeout setelah 20 detik" : message }, { status: 502 });
  }
}

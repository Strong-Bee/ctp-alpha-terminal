import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ModelItem = { id: string; name?: string; owned_by?: string; context_length?: number };

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const baseUrl = (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/$/, "");
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "NVIDIA_API_KEY belum diatur di .env.local/.env" }, { status: 400 });

  try {
    const response = await fetch(baseUrl + "/models", {
      headers: { Accept: "application/json", Authorization: "Bearer " + apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const raw = await response.text();
    let data: { data?: ModelItem[]; error?: { message?: string } };
    try { data = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "NVIDIA mengembalikan response model bukan JSON" }, { status: 502 }); }
    if (!response.ok) return NextResponse.json({ error: data.error?.message || raw.slice(0, 500) || "Gagal mengambil daftar model NVIDIA" }, { status: 502 });

    const models = Array.isArray(data.data)
      ? data.data
          .filter(x => x && typeof x.id === "string" && x.id.trim())
          .map(x => ({ id: x.id, name: x.name || x.id, ownedBy: x.owned_by || null, contextLength: x.context_length || null }))
          .sort((a,b) => a.id.localeCompare(b.id))
      : [];

    return NextResponse.json({ ok: true, provider: "nvidia", baseUrl, models, count: models.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load NVIDIA models";
    return NextResponse.json({
      error: message.toLowerCase().includes("timeout") ? "Request daftar model NVIDIA timeout setelah 20 detik" : message
    }, { status: 502 });
  }
}

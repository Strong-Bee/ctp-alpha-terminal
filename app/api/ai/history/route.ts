import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function GET() {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chats = await prisma.aIChatSession.findMany({
    where: { userEmail },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, messages: true, model: true, deepSearch: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json({ chats });
}

export async function POST(request: Request) {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim().slice(0, 160);
  const model = String(body.model || "").trim() || null;
  const deepSearch = Boolean(body.deepSearch);
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = rawMessages
    .filter((item: unknown): item is { role: unknown; content: unknown } => !!item && typeof item === "object")
    .filter(item => (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .map(item => ({ role: item.role as "user" | "assistant", content: String(item.content).slice(0, 30000) }))
    .slice(-40);

  if (!messages.length) return NextResponse.json({ error: "Messages are required" }, { status: 400 });

  const chatId = String(body.id || "").trim();
  if (chatId) {
    const existing = await prisma.aIChatSession.findFirst({ where: { id: chatId, userEmail }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    const chat = await prisma.aIChatSession.update({
      where: { id: chatId },
      data: { title: title || "AI Chat", messages, model, deepSearch },
      select: { id: true, title: true, messages: true, model: true, deepSearch: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ chat });
  }

  const chat = await prisma.aIChatSession.create({
    data: { userEmail, title: title || "AI Chat", messages, model, deepSearch },
    select: { id: true, title: true, messages: true, model: true, deepSearch: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json({ chat });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "Chat id is required" }, { status: 400 });

  const deleted = await prisma.aIChatSession.deleteMany({ where: { id, userEmail } });
  if (!deleted.count) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

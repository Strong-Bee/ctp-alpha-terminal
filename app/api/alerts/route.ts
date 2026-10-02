import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret, sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

async function currentEmail() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  return email || null;
}

export async function GET() {
  const email = await currentEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.userAlertSettings.findUnique({ where: { userEmail: email } });
  const events = await prisma.alertEvent.findMany({ where: { userEmail: email }, orderBy: { createdAt: "desc" }, take: 30 });
  return NextResponse.json({
    settings: settings ? {
      telegramEnabled: settings.telegramEnabled,
      telegramConfigured: Boolean(settings.telegramBotTokenEncrypted && settings.telegramChatId),
      telegramChatId: settings.telegramChatId ?? "",
      priceAlerts: settings.priceAlerts, newsAlerts: settings.newsAlerts, walletAlerts: settings.walletAlerts,
      launchAlerts: settings.launchAlerts, riskAlerts: settings.riskAlerts, macroAlerts: settings.macroAlerts, realtime: settings.realtime,
    } : {
      telegramEnabled: false, telegramConfigured: false, telegramChatId: "",
      priceAlerts: true, newsAlerts: true, walletAlerts: true, launchAlerts: true, riskAlerts: true, macroAlerts: true, realtime: true,
    },
    events,
  });
}

export async function POST(request: Request) {
  const email = await currentEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const token = body.telegramBotToken ? String(body.telegramBotToken).trim() : "";
  const chatId = body.telegramChatId ? String(body.telegramChatId).trim() : "";
  const settings = await prisma.userAlertSettings.upsert({
    where: { userEmail: email },
    create: {
      userEmail: email, telegramEnabled: Boolean(body.telegramEnabled),
      telegramBotTokenEncrypted: token ? encryptSecret(token) : null, telegramChatId: chatId || null,
      priceAlerts: body.priceAlerts !== false, newsAlerts: body.newsAlerts !== false, walletAlerts: body.walletAlerts !== false,
      launchAlerts: body.launchAlerts !== false, riskAlerts: body.riskAlerts !== false, macroAlerts: body.macroAlerts !== false, realtime: body.realtime !== false,
    },
    update: {
      telegramEnabled: Boolean(body.telegramEnabled),
      ...(token ? { telegramBotTokenEncrypted: encryptSecret(token) } : {}),
      telegramChatId: chatId || null,
      priceAlerts: body.priceAlerts !== false, newsAlerts: body.newsAlerts !== false, walletAlerts: body.walletAlerts !== false,
      launchAlerts: body.launchAlerts !== false, riskAlerts: body.riskAlerts !== false, macroAlerts: body.macroAlerts !== false, realtime: body.realtime !== false,
    },
  });
  return NextResponse.json({ ok: true, telegramConfigured: Boolean(settings.telegramBotTokenEncrypted && settings.telegramChatId) });
}

export async function PUT() {
  const email = await currentEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await prisma.userAlertSettings.findUnique({ where: { userEmail: email } });
  if (!settings?.telegramBotTokenEncrypted || !settings.telegramChatId) return NextResponse.json({ error: "Telegram Bot Token and Chat ID are required" }, { status: 400 });
  try {
    await sendTelegramMessage(decryptSecret(settings.telegramBotTokenEncrypted), settings.telegramChatId, "CTP Alpha Terminal\n\nTelegram alert connection is working.\nUser: " + email);
    return NextResponse.json({ ok: true, message: "Telegram test sent" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Telegram test failed" }, { status: 400 });
  }
}

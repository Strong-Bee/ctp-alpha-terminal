import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptSecret, sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

const preferenceByType: Record<string, "priceAlerts"|"newsAlerts"|"walletAlerts"|"launchAlerts"|"riskAlerts"|"macroAlerts"> = {
  price: "priceAlerts",
  news: "newsAlerts",
  wallet: "walletAlerts",
  launch: "launchAlerts",
  risk: "riskAlerts",
  macro: "macroAlerts",
};

export async function POST(request: Request) {
  const secret = process.env.ALERT_ENGINE_SECRET;
  const supplied = request.headers.get("x-alert-engine-secret");
  if (!secret || supplied !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const type = String(body.type || "news").toLowerCase();
  const title = String(body.title || "CTP Alpha Alert");
  const message = String(body.message || "");
  const severity = String(body.severity || "INFO").toUpperCase();
  const source = body.source ? String(body.source) : null;
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const preference = preferenceByType[type] || "newsAlerts";
  const settingsList = await prisma.userAlertSettings.findMany({
    where: { realtime: true, [preference]: true },
  });

  const results = await Promise.all(settingsList.map(async (settings) => {
    let sentTelegram = false;
    let sentAt: Date | null = null;
    if (settings.telegramEnabled && settings.telegramBotTokenEncrypted && settings.telegramChatId) {
      try {
        await sendTelegramMessage(
          decryptSecret(settings.telegramBotTokenEncrypted),
          settings.telegramChatId,
          "🚨 " + title + "\n\n" + message + "\n\nCTP Alpha Terminal",
        );
        sentTelegram = true;
        sentAt = new Date();
      } catch {
        sentTelegram = false;
      }
    }
    const event = await prisma.alertEvent.create({
      data: {
        userEmail: settings.userEmail,
        settingsId: settings.id,
        type,
        title,
        message,
        severity,
        source,
        sentTelegram,
        sentAt,
        metadata: body.metadata ?? undefined,
      },
    });
    return { userEmail: settings.userEmail, eventId: event.id, sentTelegram };
  }));

  return NextResponse.json({ ok: true, recipients: results.length, results });
}

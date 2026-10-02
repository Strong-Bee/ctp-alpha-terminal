CREATE TABLE "UserAlertSettings" (
  "id" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
  "telegramBotTokenEncrypted" TEXT,
  "telegramChatId" TEXT,
  "priceAlerts" BOOLEAN NOT NULL DEFAULT true,
  "newsAlerts" BOOLEAN NOT NULL DEFAULT true,
  "walletAlerts" BOOLEAN NOT NULL DEFAULT true,
  "launchAlerts" BOOLEAN NOT NULL DEFAULT true,
  "riskAlerts" BOOLEAN NOT NULL DEFAULT true,
  "macroAlerts" BOOLEAN NOT NULL DEFAULT true,
  "realtime" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserAlertSettings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserAlertSettings_userEmail_key" ON "UserAlertSettings"("userEmail");
CREATE INDEX "UserAlertSettings_userEmail_idx" ON "UserAlertSettings"("userEmail");

CREATE TABLE "AlertEvent" (
  "id" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "settingsId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'INFO',
  "source" TEXT,
  "metadata" JSONB,
  "sentTelegram" BOOLEAN NOT NULL DEFAULT false,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AlertEvent_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "UserAlertSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "AlertEvent_userEmail_createdAt_idx" ON "AlertEvent"("userEmail","createdAt");
CREATE INDEX "AlertEvent_settingsId_createdAt_idx" ON "AlertEvent"("settingsId","createdAt");

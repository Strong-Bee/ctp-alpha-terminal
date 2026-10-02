CREATE TABLE "UserAISettings" (
  "id" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'nvidia',
  "baseUrl" TEXT NOT NULL DEFAULT 'https://integrate.api.nvidia.com/v1',
  "model" TEXT NOT NULL DEFAULT 'nvidia/nemotron-3-ultra-550b-a55b',
  "apiKeyEncrypted" TEXT,
  "enableThinking" BOOLEAN NOT NULL DEFAULT true,
  "reasoningEffort" TEXT NOT NULL DEFAULT 'medium',
  "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
  "maxTokens" INTEGER NOT NULL DEFAULT 4096,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserAISettings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserAISettings_userEmail_key" ON "UserAISettings"("userEmail");
CREATE INDEX "UserAISettings_userEmail_idx" ON "UserAISettings"("userEmail");

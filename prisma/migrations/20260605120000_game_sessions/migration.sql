-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "playerName" VARCHAR(80) NOT NULL,
    "sessionTokenHash" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_sessions_createdAt_idx" ON "game_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "game_sessions_expiresAt_idx" ON "game_sessions"("expiresAt");

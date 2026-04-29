-- CreateTable
CREATE TABLE "game_results" (
    "id" TEXT NOT NULL,
    "playerName" VARCHAR(80) NOT NULL,
    "score" INTEGER NOT NULL,
    "misses" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_results_createdAt_idx" ON "game_results"("createdAt");

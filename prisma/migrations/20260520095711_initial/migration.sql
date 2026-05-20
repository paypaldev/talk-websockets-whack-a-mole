-- CreateTable
CREATE TABLE "game_results" (
    "id" TEXT NOT NULL,
    "playerName" VARCHAR(80) NOT NULL,
    "score" INTEGER NOT NULL,
    "misses" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swag_orders" (
    "id" TEXT NOT NULL,
    "itemId" VARCHAR(120) NOT NULL,
    "playerName" VARCHAR(80) NOT NULL,
    "paypalOrderId" VARCHAR(191),
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swag_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_results_createdAt_idx" ON "game_results"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "swag_orders_paypalOrderId_key" ON "swag_orders"("paypalOrderId");

-- CreateIndex
CREATE INDEX "swag_orders_createdAt_idx" ON "swag_orders"("createdAt");

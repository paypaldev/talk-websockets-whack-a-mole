-- CreateTable
CREATE TABLE "swag_orders" (
    "id" TEXT NOT NULL,
    "itemId" VARCHAR(120) NOT NULL,
    "playerName" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swag_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "swag_orders_createdAt_idx" ON "swag_orders"("createdAt");

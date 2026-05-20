-- AlterTable
ALTER TABLE "swag_orders"
ADD COLUMN "paypalOrderId" VARCHAR(191),
ADD COLUMN "amountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'USD';

-- CreateIndex
CREATE UNIQUE INDEX "swag_orders_paypalOrderId_key" ON "swag_orders"("paypalOrderId");

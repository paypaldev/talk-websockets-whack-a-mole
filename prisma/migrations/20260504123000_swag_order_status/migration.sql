-- AlterTable
ALTER TABLE "swag_orders"
ADD COLUMN "status" VARCHAR(20) NOT NULL DEFAULT 'pending';

"use server";

import { prisma } from "@/lib/prisma";
import { createPayPalCheckoutOrder } from "@/lib/paypalServer";
import { findSwagCatalogItem } from "@/lib/swagCatalog";
import { validatePlayerName } from "@/lib/playerName";

interface CreatePayPalOrderInput {
  itemId: string;
  playerName: string;
}

interface CreatedPayPalOrder {
  orderId: string;
}

interface MarkSwagOrderPaidInput {
  paypalOrderId: string;
}

interface UpdatedSwagOrder {
  id: string;
  status: string;
}

function validateInput(input: CreatePayPalOrderInput): CreatePayPalOrderInput {
  const itemId = input.itemId.trim();
  const playerName = validatePlayerName(input.playerName);

  if (itemId.length === 0) {
    throw new Error("itemId is required.");
  }

  if (itemId.length > 120) {
    throw new Error("itemId must be 120 characters or fewer.");
  }

  return {
    itemId,
    playerName,
  };
}

export async function createPayPalOrderAction(
  input: CreatePayPalOrderInput,
): Promise<CreatedPayPalOrder> {
  const validated = validateInput(input);
  const swagItem = findSwagCatalogItem(validated.itemId);

  if (!swagItem) {
    throw new Error("Unknown swag item.");
  }

  const pendingOrder = await prisma.swagOrder.create({
    data: {
      itemId: validated.itemId,
      playerName: validated.playerName,
      amountCents: swagItem.amountCents,
      currency: swagItem.currency,
      status: "pending",
    },
    select: {
      id: true,
    },
  });

  const paypalOrderId = await createPayPalCheckoutOrder({
    customId: pendingOrder.id,
    amountCents: swagItem.amountCents,
    currency: swagItem.currency,
    description: swagItem.title,
  });

  await prisma.swagOrder.update({
    where: {
      id: pendingOrder.id,
    },
    data: {
      paypalOrderId,
    },
  });

  return {
    orderId: paypalOrderId,
  };
}

function validateMarkPaidInput(
  input: MarkSwagOrderPaidInput,
): MarkSwagOrderPaidInput {
  const paypalOrderId = input.paypalOrderId.trim();

  if (paypalOrderId.length === 0) {
    throw new Error("paypalOrderId is required.");
  }

  if (paypalOrderId.length > 191) {
    throw new Error("paypalOrderId must be 191 characters or fewer.");
  }

  return { paypalOrderId };
}

export async function markSwagOrderPaidAction(
  input: MarkSwagOrderPaidInput,
): Promise<UpdatedSwagOrder> {
  const validated = validateMarkPaidInput(input);

  return prisma.swagOrder.update({
    where: {
      paypalOrderId: validated.paypalOrderId,
    },
    data: {
      status: "paid",
    },
    select: {
      id: true,
      status: true,
    },
  });
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface MarkOrderCollectedInput {
  orderId: string;
}

interface UpdatedSwagOrder {
  id: string;
  status: string;
}

function validateOrderId(input: MarkOrderCollectedInput): MarkOrderCollectedInput {
  const orderId = input.orderId.trim();

  if (orderId.length === 0) {
    throw new Error("orderId is required.");
  }

  if (orderId.length > 191) {
    throw new Error("orderId must be 191 characters or fewer.");
  }

  return { orderId };
}

export async function markOrderCollectedAction(
  input: MarkOrderCollectedInput,
): Promise<UpdatedSwagOrder> {
  const validated = validateOrderId(input);

  const updated = await prisma.swagOrder.update({
    where: {
      id: validated.orderId,
      status: "paid",
    },
    data: {
      status: "collected",
    },
    select: {
      id: true,
      status: true,
    },
  });

  revalidatePath("/booth");

  return updated;
}

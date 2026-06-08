import { prisma } from "@/lib/prisma";
import { findSwagCatalogItem } from "@/lib/swagCatalog";
import { BoothOrderList, type BoothOrder } from "./BoothOrderList";

async function getOrders(): Promise<BoothOrder[]> {
  const orders = await prisma.swagOrder.findMany({
    where: {
      status: { in: ["paid", "collected"] },
    },
    select: {
      id: true,
      itemId: true,
      playerName: true,
      amountCents: true,
      currency: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return orders.map((order) => ({
    id: order.id,
    itemId: order.itemId,
    itemTitle: findSwagCatalogItem(order.itemId)?.title ?? order.itemId,
    playerName: order.playerName,
    amountCents: order.amountCents,
    currency: order.currency,
    status: order.status as "paid" | "collected",
    createdAt: order.createdAt.toISOString(),
  }));
}

export default async function BoothPage() {
  const orders = await getOrders();

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_40%)]" />
      <div className="relative mx-auto max-w-4xl">
        <header className="mb-8 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300">
            Booth Operator
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Order Collection
          </h1>
          <p className="text-sm text-zinc-400">
            Mark orders as collected when attendees pick up their swag.
          </p>
        </header>

        <BoothOrderList initialOrders={orders} />
      </div>
    </main>
  );
}

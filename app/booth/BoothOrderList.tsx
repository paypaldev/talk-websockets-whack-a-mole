"use client";

import { useOptimistic, useTransition, useState } from "react";
import { markOrderCollectedAction } from "@/app/actions/collectSwagOrder";

export interface BoothOrder {
  id: string;
  itemId: string;
  itemTitle: string;
  playerName: string;
  amountCents: number;
  currency: string;
  status: "paid" | "collected";
  createdAt: string;
}

type Filter = "all" | "paid" | "collected";

function formatPrice(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
}

interface OrderRowProps {
  order: BoothOrder;
  onCollect: (orderId: string) => void;
  isPending: boolean;
}

function OrderRow({ order, onCollect, isPending }: OrderRowProps) {
  const isCollected = order.status === "collected";

  return (
    <li
      className={[
        "flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 sm:p-5",
        isCollected
          ? "border-white/5 bg-zinc-950/40 opacity-60"
          : "border-white/10 bg-zinc-950/70",
      ].join(" ")}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="text-base font-semibold tracking-tight text-zinc-100 truncate">
            {order.playerName}
          </span>
          <span className="text-xs text-zinc-500">{formatTime(order.createdAt)}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm text-zinc-300">{order.itemTitle}</span>
          <span className="text-xs text-zinc-500">
            {formatPrice(order.amountCents, order.currency)}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {isCollected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">
            <svg
              className="h-3 w-3"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Collected
          </span>
        ) : (
          <button
            onClick={() => onCollect(order.id)}
            disabled={isPending}
            className="rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-zinc-100 transition-colors hover:border-white/25 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark collected
          </button>
        )}
      </div>
    </li>
  );
}

interface BoothOrderListProps {
  initialOrders: BoothOrder[];
}

export function BoothOrderList({ initialOrders }: BoothOrderListProps) {
  const [filter, setFilter] = useState<Filter>("paid");
  const [isPending, startTransition] = useTransition();
  const [optimisticOrders, updateOptimistic] = useOptimistic(
    initialOrders,
    (current, collectedId: string) =>
      current.map((o) =>
        o.id === collectedId ? { ...o, status: "collected" as const } : o,
      ),
  );

  const pendingCount = optimisticOrders.filter((o) => o.status === "paid").length;
  const collectedCount = optimisticOrders.filter((o) => o.status === "collected").length;

  const filtered = optimisticOrders.filter((o) => {
    if (filter === "paid") return o.status === "paid";
    if (filter === "collected") return o.status === "collected";
    return true;
  });

  function handleCollect(orderId: string) {
    startTransition(async () => {
      updateOptimistic(orderId);
      try {
        await markOrderCollectedAction({ orderId });
      } catch (error) {
        console.error("Failed to mark order as collected", error);
      }
    });
  }

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "paid", label: "Ready for pickup", count: pendingCount },
    { key: "collected", label: "Collected", count: collectedCount },
    { key: "all", label: "All", count: optimisticOrders.length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={[
              "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === tab.key
                ? "border-white/20 bg-white/10 text-zinc-100"
                : "border-white/8 bg-transparent text-zinc-400 hover:border-white/15 hover:text-zinc-300",
            ].join(" ")}
          >
            {tab.label}
            <span
              className={[
                "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                filter === tab.key
                  ? "bg-white/15 text-zinc-200"
                  : "bg-white/5 text-zinc-500",
              ].join(" ")}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-zinc-950/40 px-6 py-14 text-center">
          <p className="text-sm text-zinc-500">
            {filter === "paid"
              ? "No orders waiting for pickup."
              : filter === "collected"
                ? "No orders collected yet."
                : "No orders yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onCollect={handleCollect}
              isPending={isPending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

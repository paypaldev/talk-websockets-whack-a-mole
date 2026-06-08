"use client";

import { type RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RequirePlayerName } from "@/app/components/name-gate/RequirePlayerName";
import {
  createPayPalOrderAction,
  markSwagOrderPaidAction,
} from "@/app/actions/createSwagOrder";
import {
  PayPalProvider,
  PayPalOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
import ReactCanvasConfetti from "react-canvas-confetti";
import {
  assignConfettiLauncher,
  fireCelebrationConfetti,
  type ConfettiLauncher,
} from "@/lib/confetti";
import { swagCatalog } from "@/lib/swagCatalog";
import {
  LEADERBOARD_SWAG_CHANNEL,
  SWAG_STORE_CELEBRATION_EVENT,
  SWAG_STORE_CHECKOUT_ENABLED_EVENT,
  isSwagCelebrationBroadcastPayload,
  isSwagCheckoutBroadcastPayload,
  getSupabaseBrowserClient,
} from "@/lib/supabaseBrowser";
import { SandboxTestCards } from "./SandboxTestCards";

const swagItems = swagCatalog;

interface SwagStoreContentProps {
  playerName: string;
}

function formatSwagPrice(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

function SwagStoreContent({ playerName }: SwagStoreContentProps) {
  const paypalEnvironment =
    process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "live"
      ? "production"
      : "sandbox";
  const [orderStatusMessage, setOrderStatusMessage] = useState<string | null>(
    null,
  );
  const [recentlyOrderedItemTitle, setRecentlyOrderedItemTitle] = useState<
    string | null
  >(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  );
  const [isPayPalButtonEnabled, setIsPayPalButtonEnabled] = useState(true);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const swagChannelRef = useRef<RealtimeChannel | null>(null);
  const confettiRef = useRef<ConfettiLauncher | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const swagChannel = (swagChannelRef.current = supabase.channel(
      LEADERBOARD_SWAG_CHANNEL,
    ));

    swagChannel
      .on(
        "broadcast",
        { event: SWAG_STORE_CHECKOUT_ENABLED_EVENT },
        ({ payload }) => {
          if (!isSwagCheckoutBroadcastPayload(payload)) {
            return;
          }

          setIsPayPalButtonEnabled(payload.enabled);
        },
      )
      .on(
        "broadcast",
        { event: SWAG_STORE_CELEBRATION_EVENT },
        ({ payload }) => {
          if (!isSwagCelebrationBroadcastPayload(payload)) {
            return;
          }

          fireCelebrationConfetti(confettiRef.current);
        },
      )
      .subscribe();

    return () => {
      swagChannelRef.current = null;
      void swagChannel.unsubscribe();
    };
  }, []);

  async function createOrder(itemId: string): Promise<{ orderId: string }> {
    const createdOrder = await createPayPalOrderAction({
      itemId,
      playerName,
    });

    return { orderId: createdOrder.orderId };
  }

  async function onApprove(data: unknown, itemId: string): Promise<void> {
    const orderId =
      (data as { orderId?: string; orderID?: string }).orderId ??
      (data as { orderId?: string; orderID?: string }).orderID;

    if (!orderId?.trim()) {
      console.error("Unable to mark swag order as paid: missing orderId", data);
      return;
    }

    try {
      await markSwagOrderPaidAction({ paypalOrderId: orderId });
      const purchasedItem = swagItems.find((item) => item.id === itemId);

      setOrderStatusMessage("Payment complete!");
      setRecentlyOrderedItemTitle(purchasedItem?.title ?? null);
      setHighlightedItemId(itemId);
      fireCelebrationConfetti(confettiRef.current);

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedItemId(null);
      }, 10_000);
    } catch (error) {
      console.error("Unable to mark swag order as paid", error);
    }
  }

  return (
    <PayPalProvider
      clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}
      components={["paypal-payments"]}
      pageType="checkout"
      environment={paypalEnvironment}
    >
      <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
        <ReactCanvasConfetti
          className="pointer-events-none fixed inset-0 z-40"
          style={{ width: "100vw", height: "100vh" }}
          globalOptions={{ resize: true, useWorker: true }}
          onInit={({ confetti }) => {
            assignConfettiLauncher(confettiRef, confetti);
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
          <header className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300">
                Swag
              </span>

              {/* <Link
                href="/leaderboard"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/10"
              >
                Leaderboard
              </Link> */}
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                Swag Store
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
                This page is ready for upcoming swag content and purchasing
                functionality.
              </p>
              {orderStatusMessage ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-4 w-full rounded-2xl border border-emerald-300/45 bg-emerald-400/12 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.22),0_20px_55px_rgba(16,185,129,0.14)] sm:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/90">
                    Order Confirmed
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-100 sm:text-3xl">
                    {orderStatusMessage}
                  </p>
                  {recentlyOrderedItemTitle ? (
                    <p className="mt-2 text-sm text-emerald-100/90 sm:text-base">
                      {recentlyOrderedItemTitle} is on the way.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </header>

          <SandboxTestCards />

          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {swagItems.map((item) => (
              <article
                key={item.id}
                className={[
                  "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-zinc-950/70 backdrop-blur-sm transition-all duration-500",
                  highlightedItemId === item.id
                    ? "border-emerald-300/70 shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_45px_rgba(16,185,129,0.35)]"
                    : "border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]",
                ].join(" ")}
              >
                {highlightedItemId === item.id ? (
                  <span className="absolute right-3 top-3 z-10 rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-950 shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
                    Just Ordered
                  </span>
                ) : null}

                <div className="relative aspect-4/3 w-full border-b border-white/10">
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    loading="eager"
                  />
                </div>

                <div className="flex-1 space-y-3 p-5">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                        {item.title}
                      </h2>
                      <p className="shrink-0 text-sm font-semibold text-emerald-300">
                        {formatSwagPrice(item.amountCents, item.currency)}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex justify-center px-5 pb-5">
                  <PayPalOneTimePaymentButton
                    createOrder={() => createOrder(item.id)}
                    onApprove={(data) => onApprove(data, item.id)}
                    onCancel={(data) => console.log("Cancelled:", data)}
                    onError={(error) => console.error("Error:", error)}
                    presentationMode="popup"
                    type="checkout"
                    disabled={
                      !isPayPalButtonEnabled || highlightedItemId !== null
                    }
                  />
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </PayPalProvider>
  );
}

export default function SwagStorePage() {
  return (
    <RequirePlayerName
      fallback={
        <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />
        </main>
      }
    >
      {(playerName) => <SwagStoreContent playerName={playerName} />}
    </RequirePlayerName>
  );
}

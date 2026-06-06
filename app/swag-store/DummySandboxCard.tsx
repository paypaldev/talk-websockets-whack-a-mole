"use client";

import { useState } from "react";

interface SandboxCard {
  brand: string;
  number: string;
  cvv: string;
  expiry: string;
  gradientClassName: string;
}

const SANDBOX_TEST_CARDS: SandboxCard[] = [
  {
    brand: "Visa",
    number: "4032033744272175",
    cvv: "025",
    expiry: "04/2030",
    gradientClassName:
      "bg-[linear-gradient(135deg,#1f8f7a_0%,#145f70_55%,#0f3f59_100%)]",
  },
  {
    brand: "Visa",
    number: "4032034620159700",
    cvv: "158",
    expiry: "08/2029",
    gradientClassName:
      "bg-[linear-gradient(135deg,#2b2b66_0%,#1e3a8a_55%,#0f2557_100%)]",
  },
  {
    brand: "Visa",
    number: "4032031251120548",
    cvv: "486",
    expiry: "08/2031",
    gradientClassName:
      "bg-[linear-gradient(135deg,#7a2e1f_0%,#b45309_52%,#7c2d12_100%)]",
  },
];

function getRandomCardIndex(excludingIndex?: number): number {
  if (SANDBOX_TEST_CARDS.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * SANDBOX_TEST_CARDS.length);

  while (nextIndex === excludingIndex) {
    nextIndex = Math.floor(Math.random() * SANDBOX_TEST_CARDS.length);
  }

  return nextIndex;
}

export function DummySandboxCard() {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(() =>
    getRandomCardIndex(),
  );

  const selectedCard =
    SANDBOX_TEST_CARDS[selectedCardIndex] ?? SANDBOX_TEST_CARDS[0];

  const refreshDummyCard = () => {
    setSelectedCardIndex((currentIndex) => getRandomCardIndex(currentIndex));
  };

  return (
    <div
      key={`${selectedCard.brand}-${selectedCard.number}`}
      className={`w-full overflow-hidden rounded-2xl border border-white/20 ${selectedCard.gradientClassName} p-5 text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.45)]`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-100/80">
          Dummy Card
        </span>
        <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
          {selectedCard.brand}
        </span>
      </div>

      <p className="mt-6 text-2xl font-semibold tracking-[0.08em] text-white">
        {selectedCard.number}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
            CVV
          </p>
          <p className="mt-1 font-semibold text-white">{selectedCard.cvv}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
            Expiry
          </p>
          <p className="mt-1 font-semibold text-white">{selectedCard.expiry}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={refreshDummyCard}
          aria-label="Refresh dummy card"
          title="Refresh dummy card"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition hover:bg-white/20"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15.6-6.36L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15.6 6.36L3 16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

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

const RANDOM_SANDBOX_CARD =
  SANDBOX_TEST_CARDS[Math.floor(Math.random() * SANDBOX_TEST_CARDS.length)] ??
  SANDBOX_TEST_CARDS[0];

export function SandboxTestCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
      <div
        key={`${RANDOM_SANDBOX_CARD.brand}-${RANDOM_SANDBOX_CARD.number}`}
        className={`w-full overflow-hidden rounded-2xl border border-white/20 ${RANDOM_SANDBOX_CARD.gradientClassName} p-5 text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.45)]`}
      >
        <div className="flex items-start justify-between">
          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-100/80">
            Dummy Card
          </span>
          <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
            {RANDOM_SANDBOX_CARD.brand}
          </span>
        </div>

        <p className="mt-6 text-2xl font-semibold tracking-[0.08em] text-white">
          {RANDOM_SANDBOX_CARD.number}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
              CVV
            </p>
            <p className="mt-1 font-semibold text-white">
              {RANDOM_SANDBOX_CARD.cvv}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
              Expiry
            </p>
            <p className="mt-1 font-semibold text-white">
              {RANDOM_SANDBOX_CARD.expiry}
            </p>
          </div>
        </div>
      </div>

      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-cyan-100/30 bg-[linear-gradient(145deg,#0f172a_0%,#1e293b_50%,#0b1120_100%)] p-5 text-zinc-100 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between">
          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-100/80">
            Prize Preview
          </span>
          <span className="rounded-full border border-cyan-200/40 bg-cyan-200/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
            iPad Air
          </span>
        </div>

        <div className="mt-4 grid flex-1 grid-cols-[1.15fr_0.85fr] gap-3">
          <div className="grid content-start gap-1 text-sm">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-200/80">
              Prize
            </p>
            <p className="font-semibold text-white">iPad Air</p>
            <p className="text-xs text-zinc-200/80">
              The top player at the end of the day wins this prize! You must be
              at the PayPal booth to claim it at 5pm.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/20 bg-white/[0.04]">
            <video
              className="h-full max-h-[118px] w-full object-cover"
              autoPlay
              loop
              muted
              preload="metadata"
              playsInline
              aria-label="Apple iPad Air prize preview"
            >
              <source src="/ipad.mov" />
              Your browser does not support this video format.
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}

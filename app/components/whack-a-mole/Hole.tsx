import type { MoleType } from "./useGameEngine";

interface HoleProps {
  moleType: MoleType | null;
  onWhack: () => void;
}

export function Hole({ moleType, onWhack }: HoleProps) {
  const isPayPal = moleType === "paypal";
  return (
    <button
      className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-full border border-white/10 bg-zinc-950 focus:outline-none touch-manipulation"
      style={{
        background:
          "radial-gradient(circle at 35% 35%, #18181b 0%, #0b0b0d 58%, #050507 100%)",
        boxShadow: moleType
          ? isPayPal
            ? "inset 0 4px 14px rgba(0,0,0,0.8), 0 0 0 2px rgba(125,211,252,0.75), 0 0 18px rgba(56,189,248,0.35)"
            : "inset 0 4px 14px rgba(0,0,0,0.75), 0 0 0 2px rgba(255,255,255,0.14)"
          : "inset 0 4px 14px rgba(0,0,0,0.75), 0 1px 4px rgba(0,0,0,0.4)",
      }}
      onClick={onWhack}
      aria-label={
        moleType === "paypal"
          ? "Whack the PayPal logo — 10 points!"
          : moleType === "mole"
            ? "Whack the mole!"
            : "Empty hole"
      }
    >
      {moleType && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={moleType}
          src={isPayPal ? "/paypal-logo.svg" : "/mole.png"}
          alt={isPayPal ? "PayPal logo — bonus!" : "Mole"}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain p-[8%]"
          style={{
            animation:
              "mole-appear 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
          draggable={false}
        />
      )}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { WhackAMole } from "../whack-a-mole/WhackAMole";
import { RequirePlayerName } from "./RequirePlayerName";

function detectMobile(): boolean {
  return (
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );
}

const backgroundGradient = (
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />
);

export function GameRouteGate() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(detectMobile());
  }, []);

  if (isMobile === false) {
    return (
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
        {backgroundGradient}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <p className="text-4xl">📱</p>
          <h1 className="text-2xl font-bold text-white">Mobile Only</h1>
          <p className="max-w-xs text-sm text-white/60">
            This game is designed for mobile devices. Please scan the QR code
            and play on your phone!
          </p>
        </div>
      </main>
    );
  }

  return (
    <RequirePlayerName
      fallback={
        <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
          {backgroundGradient}
        </main>
      }
    >
      {(playerName) => (
        <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
          {backgroundGradient}
          <WhackAMole playerName={playerName} />
        </main>
      )}
    </RequirePlayerName>
  );
}

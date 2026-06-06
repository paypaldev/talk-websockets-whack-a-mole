import type { MutableRefObject } from "react";

export interface ConfettiOptions {
  startVelocity: number;
  ticks: number;
  gravity: number;
  scalar: number;
  zIndex: number;
  particleCount: number;
  spread: number;
  origin: {
    x: number;
    y: number;
  };
}

export type ConfettiLauncher = (
  options: ConfettiOptions,
) => Promise<null> | null;

function isConfettiLauncher(value: unknown): value is ConfettiLauncher {
  return typeof value === "function";
}

export function assignConfettiLauncher(
  confettiRef: MutableRefObject<ConfettiLauncher | null>,
  confetti: unknown,
): void {
  if (!isConfettiLauncher(confetti)) {
    return;
  }

  confettiRef.current = confetti;
}

export function fireCelebrationConfetti(
  confetti: ConfettiLauncher | null,
): void {
  if (!confetti) {
    return;
  }

  const baseConfig = {
    startVelocity: 40,
    ticks: 220,
    gravity: 0.8,
    scalar: 1,
    zIndex: 150,
  };

  confetti({
    ...baseConfig,
    particleCount: 160,
    spread: 135,
    origin: { x: 0.5, y: 0.56 },
  });
  confetti({
    ...baseConfig,
    particleCount: 120,
    startVelocity: 50,
    spread: 95,
    origin: { x: 0.5, y: 0.38 },
  });
  confetti({
    ...baseConfig,
    particleCount: 120,
    spread: 180,
    origin: { x: 0.5, y: 0.72 },
  });
}

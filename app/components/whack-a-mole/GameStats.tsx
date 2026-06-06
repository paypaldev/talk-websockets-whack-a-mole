import {
  GAME_DURATION,
  PAYPAL_BONUS_POINTS,
  PAYPAL_MOLE_MAX,
  getDifficultyPhaseIndex,
} from "./useGameEngine";

interface GameStatsProps {
  score: number;
  timeRemaining: number;
}

export function GameStats({ score, timeRemaining }: GameStatsProps) {
  const progressPercent = (timeRemaining / GAME_DURATION) * 100;
  const elapsedSecs = GAME_DURATION - timeRemaining;
  const difficultyPhaseIndex = getDifficultyPhaseIndex(elapsedSecs);
  const isUrgent = timeRemaining <= 10;

  const progressBarBackgrounds = [
    "linear-gradient(90deg, #60a5fa 0%, #22d3ee 100%)",
    "linear-gradient(90deg, #fb923c 0%, #f97316 100%)",
    "linear-gradient(90deg, #fb7185 0%, #f43f5e 100%)",
  ] as const;

  const progressBarBackground =
    progressBarBackgrounds[difficultyPhaseIndex] ??
    progressBarBackgrounds[progressBarBackgrounds.length - 1];

  return (
    <div className="border-b border-white/10 px-4 py-3.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="rounded-lg border border-white/10 bg-white/3 px-3 py-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            Score
          </span>
          <span
            key={score}
            className="block text-2xl font-semibold tabular-nums text-zinc-100"
            style={{
              animation:
                score > 0 ? "score-pop 0.35s ease-out forwards" : undefined,
            }}
          >
            {score}
          </span>
        </div>

        <div className="flex-1 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-center text-[11px] leading-tight text-sky-100">
          <span className="block font-semibold uppercase tracking-[0.16em] text-sky-200/85">
            Heads up
          </span>
          <span className="mt-1 block">
            PayPal logos are worth {PAYPAL_BONUS_POINTS} points. Only{" "}
            {PAYPAL_MOLE_MAX} show up each game.
          </span>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-right">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            Time
          </span>
          <span
            className={`block text-2xl font-semibold tabular-nums ${
              isUrgent ? "text-rose-300" : "text-zinc-100"
            }`}
          >
            {timeRemaining}
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progressPercent}%`,
            background: progressBarBackground,
          }}
        />
      </div>
    </div>
  );
}

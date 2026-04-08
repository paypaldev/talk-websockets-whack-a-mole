import { GAME_DURATION } from './useGameEngine'

interface GameStatsProps {
  score: number
  timeRemaining: number
}

export function GameStats({ score, timeRemaining }: GameStatsProps) {
  const progressPercent = (timeRemaining / GAME_DURATION) * 100
  const isUrgent = timeRemaining <= 10

  return (
    <div className="px-4 py-3 bg-[#001C64] border-b border-[#003087]">
      <div className="flex items-center justify-between mb-2">
        {/* Score */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#009CDE]">
            Score
          </span>
          {/* key changes on every score increment, restarting the pop animation */}
          <span
            key={score}
            className="text-3xl font-black text-[#FFC439] tabular-nums"
            style={{ animation: score > 0 ? 'score-pop 0.35s ease-out forwards' : undefined }}
          >
            {score}
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-3xl font-black tabular-nums"
            style={{ color: isUrgent ? '#ff4d4d' : '#FFC439' }}
          >
            {timeRemaining}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#009CDE]">
            sec
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-[#003087] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: isUrgent ? '#ff4d4d' : '#FFC439',
          }}
        />
      </div>
    </div>
  )
}

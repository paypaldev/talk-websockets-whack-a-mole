interface EndScreenProps {
  score: number
  misses: number
  onRestart: () => void
}

function getRating(score: number): { emoji: string; label: string } {
  if (score >= 30) return { emoji: '🏆', label: 'Legendary!' }
  if (score >= 20) return { emoji: '🥇', label: 'Champion!' }
  if (score >= 12) return { emoji: '🎉', label: 'Great job!' }
  if (score >= 6) return { emoji: '👍', label: 'Not bad!' }
  return { emoji: '🐌', label: 'Keep trying!' }
}

export function EndScreen({ score, misses, onRestart }: EndScreenProps) {
  const { emoji, label } = getRating(score)
  const total = score + misses
  const accuracy = total === 0 ? 0 : Math.round((score / total) * 100)

  return (
    <div className="flex flex-col items-center gap-5 bg-zinc-950/30 px-6 py-9 text-center">
      <div
        className="text-4xl"
        style={{ animation: 'mole-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      >
        {emoji}
      </div>

      <div>
        <h2 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-100">Time&apos;s Up</h2>
        <p className="text-sm text-zinc-400">{label}</p>
      </div>

      <div
        className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/3 px-10 py-5"
        style={{ animation: 'mole-appear 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <span className="text-6xl font-semibold tabular-nums text-zinc-100">{score}</span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
          moles whacked
        </span>
      </div>

      <div
        className="flex w-full divide-x divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/3"
        style={{ animation: 'mole-appear 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="flex flex-1 flex-col items-center py-3">
          <span className="text-2xl font-semibold tabular-nums text-emerald-300">{score}</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">Hits</span>
        </div>
        <div className="flex flex-1 flex-col items-center py-3">
          <span className="text-2xl font-semibold tabular-nums text-rose-300">{misses}</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">Misses</span>
        </div>
        <div className="flex flex-1 flex-col items-center py-3">
          <span className="text-2xl font-semibold tabular-nums text-sky-300">{accuracy}%</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">Accuracy</span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="inline-flex items-center rounded-lg border border-white/15 bg-white/3 px-8 py-3 text-base font-semibold text-zinc-100 transition-colors hover:bg-white/9 active:scale-[0.98]"
      >
        Play Again
      </button>
    </div>
  )
}

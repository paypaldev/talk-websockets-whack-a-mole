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
    <div className="flex flex-col items-center gap-5 py-10 px-6 text-center bg-[#001C64]">
      <div
        className="text-5xl"
        style={{ animation: 'mole-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      >
        {emoji}
      </div>

      <div>
        <h2 className="text-2xl font-black text-[#FFC439] mb-1">Time&apos;s Up!</h2>
        <p className="text-[#009CDE] text-sm">{label}</p>
      </div>

      {/* Score display */}
      <div
        className="flex flex-col items-center gap-1 rounded-2xl py-5 px-10"
        style={{
          background: 'linear-gradient(180deg, #FFD140 0%, #FFC439 60%, #E5A800 100%)',
          animation: 'mole-appear 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
          boxShadow: '0 6px 24px rgba(255,196,57,0.4)',
        }}
      >
        <span className="text-6xl font-black text-[#001C64] tabular-nums">{score}</span>
        <span className="text-sm font-bold text-[#003087] uppercase tracking-widest">
          moles whacked
        </span>
      </div>

      {/* Hit/miss breakdown */}
      <div
        className="w-full flex divide-x divide-[#003087] border border-[#003087] rounded-2xl overflow-hidden"
        style={{ animation: 'mole-appear 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="flex-1 flex flex-col items-center py-3">
          <span className="text-2xl font-black text-[#00C853] tabular-nums">{score}</span>
          <span className="text-xs text-[#009CDE] uppercase tracking-widest">Hits</span>
        </div>
        <div className="flex-1 flex flex-col items-center py-3">
          <span className="text-2xl font-black text-[#ff4d4d] tabular-nums">{misses}</span>
          <span className="text-xs text-[#009CDE] uppercase tracking-widest">Misses</span>
        </div>
        <div className="flex-1 flex flex-col items-center py-3">
          <span className="text-2xl font-black text-[#FFC439] tabular-nums">{accuracy}%</span>
          <span className="text-xs text-[#009CDE] uppercase tracking-widest">Accuracy</span>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-10 py-3.5 font-black rounded-full text-lg active:scale-95 transition-all"
        style={{
          background: 'linear-gradient(180deg, #FFD140 0%, #FFC439 60%, #E5A800 100%)',
          color: '#001C64',
          boxShadow: '0 4px 14px rgba(255,196,57,0.45)',
        }}
      >
        Play Again
      </button>
    </div>
  )
}

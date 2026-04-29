import Image from 'next/image'

interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10 text-center">
      <Image
        src="/mole.png"
        alt="Mole"
        width={116}
        height={72}
        className="drop-shadow-[0_8px_24px_rgba(255,255,255,0.15)]"
        style={{ animation: 'mole-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      />

      <div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">Tap to whack</h2>
        <p className="max-w-56 text-sm leading-relaxed text-zinc-400">
          Moles pop up for 30 seconds. Chase accuracy and rack up points fast.
        </p>
      </div>

      <div className="w-full space-y-2 text-left text-xs text-zinc-400">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/3 px-3 py-2">
          <span>Speed ramp</span>
          <span className="font-medium text-zinc-200">Slow to fast</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/3 px-3 py-2">
          <span>Duration</span>
          <span className="font-medium text-zinc-200">30s</span>
        </div>
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-sky-300/30 bg-sky-400/10 px-3 py-2 text-sky-200">
          <Image src="/paypal-logo.svg" alt="PayPal" width={20} height={20} className="shrink-0" />
          <span>Bonus logo gives <strong>10 pts</strong> in the last 10 seconds</span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="mt-2 inline-flex items-center rounded-lg border border-white/15 bg-white/3 px-8 py-3 text-base font-semibold text-zinc-100 transition-colors hover:bg-white/9 active:scale-[0.98]"
      >
        Start Game
      </button>
    </div>
  )
}

interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/paypal-logo.svg"
        alt="PayPal"
        className="w-20 h-20 drop-shadow-lg"
        style={{ animation: 'mole-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      />

      <div>
        <h2 className="text-2xl font-black text-[#001C64] mb-2">Tap to whack!</h2>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-50">
          PayPal icons pop up for 30 seconds. Tap them as fast as you can!
        </p>
      </div>

      <div className="flex flex-col gap-2 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-base">🐢</span>
          <span>Starts slow… then speeds up!</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span>React fast to beat your high score</span>
        </div>
        <div
          className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl font-semibold"
          style={{ background: 'rgba(255,196,57,0.15)', color: '#E5A800' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/paypal-logo.svg" alt="PayPal" className="w-5 h-5 shrink-0" />
          <span>PayPal logo = <strong>10 pts</strong> — last 10 secs only!</span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="mt-2 px-10 py-3.5 font-black rounded-full text-lg
                   active:scale-95 transition-all shadow-lg"
        style={{
          background: 'linear-gradient(180deg, #FFD140 0%, #FFC439 60%, #E5A800 100%)',
          color: '#001C64',
          boxShadow: '0 4px 14px rgba(255,196,57,0.45)',
        }}
      >
        Start Game
      </button>
    </div>
  )
}

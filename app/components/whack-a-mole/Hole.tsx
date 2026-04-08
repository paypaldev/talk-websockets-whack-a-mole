import type { MoleType } from './useGameEngine'

interface HoleProps {
  moleType: MoleType | null
  onWhack: () => void
}

export function Hole({ moleType, onWhack }: HoleProps) {
  const isPayPal = moleType === 'paypal'
  return (
    <button
      className="relative aspect-square w-full rounded-full cursor-pointer focus:outline-none touch-manipulation overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 35% 35%, #3d2000 0%, #1a0800 55%, #0d0300 100%)',
        boxShadow: moleType
          ? isPayPal
            ? 'inset 0 4px 14px rgba(0,0,0,0.85), 0 0 0 3px #FFC439, 0 0 14px 4px rgba(255,196,57,0.55)'
            : 'inset 0 4px 14px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.4)'
          : 'inset 0 4px 14px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.4)',
      }}
      onClick={onWhack}
      aria-label={
        moleType === 'paypal'
          ? 'Whack the PayPal logo — 10 points!'
          : moleType === 'mole'
          ? 'Whack the mole!'
          : 'Empty hole'
      }
    >
      {moleType && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={moleType}
          src={isPayPal ? '/paypal-logo.svg' : '/mole.png'}
          alt={isPayPal ? 'PayPal logo — bonus!' : 'Mole'}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none p-[8%]"
          style={{ animation: 'mole-appear 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
          draggable={false}
        />
      )}
    </button>
  )
}

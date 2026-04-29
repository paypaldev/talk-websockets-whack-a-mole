'use client'

import { useGameEngine } from './useGameEngine'
import { GameBoard } from './GameBoard'
import { GameStats } from './GameStats'
import { StartScreen } from './StartScreen'
import { EndScreen } from './EndScreen'

export function WhackAMole() {
  const { gameState, score, misses, timeRemaining, activeMoles, startGame, whackMole } =
    useGameEngine()

  return (
    <div className="relative z-10 mx-auto w-full max-w-sm select-none overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/75 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
        <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/paypal-logo.svg" alt="PayPal" className="h-8 w-8" />
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Whack-a-Mole</h1>
        </div>
        <span className="rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
          Arcade
        </span>
      </div>

      {gameState === 'idle' && <StartScreen onStart={startGame} />}

      {gameState === 'playing' && (
        <>
          <GameStats score={score} timeRemaining={timeRemaining} />
          <GameBoard activeMoles={activeMoles} onWhack={whackMole} />
        </>
      )}

      {gameState === 'ended' && <EndScreen score={score} misses={misses} onRestart={startGame} />}
    </div>
  )
}

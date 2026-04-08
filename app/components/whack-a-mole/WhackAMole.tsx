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
    <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl bg-white select-none">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(90deg, #001C64 0%, #003087 100%)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/paypal-logo.svg" alt="PayPal" className="w-9 h-9" />
        <h1 className="text-white font-black text-xl tracking-tight">Whack-a-Mole</h1>
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

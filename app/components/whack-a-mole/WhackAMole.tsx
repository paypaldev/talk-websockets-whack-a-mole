'use client'

import { useEffect, useState, useRef } from 'react'
import { saveGameResultAction } from '@/app/actions/saveGameResult'
import { useGameEngine } from './useGameEngine'
import { GameBoard } from './GameBoard'
import { GameStats } from './GameStats'
import { StartScreen } from './StartScreen'
import { EndScreen } from './EndScreen'
import {
  ACTIVE_GAMES_CHANNEL,
  LEADERBOARD_SWAG_CHANNEL,
  SWAG_STORE_ENABLED_EVENT,
  getSupabaseBrowserClient,
} from '@/lib/supabaseBrowser'

interface SwagStoreBroadcastPayload {
  showSwagStore: boolean
}

function isSwagStoreBroadcastPayload(value: unknown): value is SwagStoreBroadcastPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return typeof candidate.showSwagStore === 'boolean'
}

interface WhackAMoleProps {
  playerName?: string
}

export function WhackAMole({ playerName }: WhackAMoleProps) {
  const { gameState, score, misses, timeRemaining, activeMoles, startGame, whackMole } =
    useGameEngine()
  const [showSwagStoreButton, setShowSwagStoreButton] = useState(false)
  const previousGameStateRef = useRef(gameState)
  const realtimeSessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    const previousGameState = previousGameStateRef.current
    previousGameStateRef.current = gameState

    if (previousGameState !== 'playing' || gameState !== 'ended') {
      return
    }

    const trimmedPlayerName = playerName?.trim()
    if (!trimmedPlayerName) {
      return
    }

    void saveGameResultAction({
        playerName: trimmedPlayerName,
        score,
        misses,
      }).catch(() => {
        // Intentionally swallow to avoid blocking end-screen UX.
      })
  }, [gameState, misses, playerName, score])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    const swagChannel = supabase.channel(LEADERBOARD_SWAG_CHANNEL)

    swagChannel
      .on('broadcast', { event: SWAG_STORE_ENABLED_EVENT }, ({ payload }) => {
        if (!isSwagStoreBroadcastPayload(payload)) {
          return
        }

        if (payload.showSwagStore) {
          setShowSwagStoreButton(true)
        }
      })
      .subscribe()

    return () => {
      void swagChannel.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') {
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    if (!realtimeSessionIdRef.current) {
      realtimeSessionIdRef.current = crypto.randomUUID()
    }

    const channel = supabase.channel(ACTIVE_GAMES_CHANNEL, {
      config: {
        presence: {
          key: realtimeSessionIdRef.current,
        },
      },
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        void channel.track({
          playerName: playerName?.trim() || 'Anonymous',
          startedAt: new Date().toISOString(),
        })
      }
    })

    return () => {
      void channel.untrack()
      void channel.unsubscribe()
    }
  }, [gameState, playerName])

  return (
    <div className="relative z-10 mx-auto w-full max-w-sm select-none overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/75 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/paypal-logo.svg" alt="PayPal" className="h-8 w-8" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Whack-a-Mole</h1>
            {playerName && (
              <p className="text-[11px] leading-none text-zinc-400">Player: {playerName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            Arcade
          </span>
        </div>
      </div>

      {gameState === 'idle' && (
        <StartScreen onStart={startGame} showSwagStoreButton={showSwagStoreButton} />
      )}

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

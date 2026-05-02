'use client'

import { useEffect, useState } from 'react'
import {
  ACTIVE_GAMES_CHANNEL,
  GAME_RESULTS_CHANNEL,
  getSupabaseBrowserClient,
} from '@/lib/supabaseBrowser'

interface PlayersCardProps {
  uniquePlayers: number
  totalGamesPlayed: number
}

export function PlayersCard({ uniquePlayers, totalGamesPlayed }: PlayersCardProps) {
  const [activeGames, setActiveGames] = useState(0)
  const [totalGamesPlayedCount, setTotalGamesPlayedCount] = useState(totalGamesPlayed)
  const [realtimeReady, setRealtimeReady] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    let isMounted = true

    const activeGamesChannel = supabase.channel(ACTIVE_GAMES_CHANNEL)
    const gamesCountChannel = supabase.channel(GAME_RESULTS_CHANNEL)

    const syncActiveGames = () => {
      const presenceState = activeGamesChannel.presenceState()
      const gameCount = Object.values(presenceState).reduce((total, sessions) => {
        return total + sessions.length
      }, 0)
      setActiveGames(gameCount)
    }

    const syncTotalGamesPlayed = async () => {
      const { count, error } = await supabase
        .from('game_results')
        .select('id', { count: 'exact', head: true })

      if (error || !isMounted || typeof count !== 'number') {
        return
      }

      setTotalGamesPlayedCount(count)
    }

    activeGamesChannel
      .on('presence', { event: 'sync' }, () => {
        syncActiveGames()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeReady(true)
          syncActiveGames()
        }
      })

    const statusesToResync = ['SUBSCRIBED', 'TIMED_OUT', 'CHANNEL_ERROR', 'CLOSED'] as const
    gamesCountChannel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_results' }, () => {
        setTotalGamesPlayedCount((currentCount) => currentCount + 1)
      })
      .subscribe((status) => {
        if (statusesToResync.includes(status)) {
          void syncTotalGamesPlayed()
        }
      })

    return () => {
      isMounted = false
      setRealtimeReady(false)
      void activeGamesChannel.unsubscribe()
      void gamesCountChannel.unsubscribe()
    }
  }, [])

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Players</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-50">{uniquePlayers}</p>
      <div className="mt-1 flex items-center justify-between gap-4 text-xs text-zinc-400">
        <p>
          Total games played:{' '}
          <span className="font-semibold text-zinc-200 tabular-nums">{totalGamesPlayedCount}</span>
        </p>
        <p className="text-right">
          Games in progress:{' '}
          <span className="font-semibold text-zinc-200 tabular-nums">{activeGames}</span>
          {!realtimeReady && <span className="ml-2 text-zinc-500">(realtime offline)</span>}
        </p>
      </div>
    </div>
  )
}

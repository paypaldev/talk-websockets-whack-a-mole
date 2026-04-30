'use client'

import { useEffect, useState } from 'react'
import { ACTIVE_GAMES_CHANNEL, getSupabaseBrowserClient } from '@/lib/supabaseBrowser'

interface PlayersCardProps {
  uniquePlayers: number
}

export function PlayersCard({ uniquePlayers }: PlayersCardProps) {
  const [activeGames, setActiveGames] = useState(0)
  const [realtimeReady, setRealtimeReady] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    const channel = supabase.channel(ACTIVE_GAMES_CHANNEL)

    const syncActiveGames = () => {
      const presenceState = channel.presenceState()
      const gameCount = Object.values(presenceState).reduce((total, sessions) => {
        return total + sessions.length
      }, 0)
      setActiveGames(gameCount)
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        syncActiveGames()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeReady(true)
          syncActiveGames()
        }
      })

    return () => {
      setRealtimeReady(false)
      void channel.unsubscribe()
    }
  }, [])

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Players</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-50">{uniquePlayers}</p>
      <p className="mt-1 text-xs text-zinc-400">
        Games in progress:{' '}
        <span className="font-semibold text-zinc-200 tabular-nums">{activeGames}</span>
        {!realtimeReady && <span className="ml-2 text-zinc-500">(realtime offline)</span>}
      </p>
    </div>
  )
}

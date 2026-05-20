'use client'

import { type RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  GAME_RESULTS_LEADERBOARD_CHANNEL,
  LEADERBOARD_SWAG_CHANNEL,
  type SwagCelebrationBroadcastPayload,
  type SwagCheckoutBroadcastPayload,
  type SwagStoreBroadcastPayload,
  SWAG_STORE_CELEBRATION_EVENT,
  SWAG_STORE_CHECKOUT_ENABLED_EVENT,
  SWAG_STORE_ENABLED_EVENT,
  getSupabaseBrowserClient,
} from '@/lib/supabaseBrowser'
import { PlayersCard } from './PlayersCard'
import { RealtimeBadge, type RealtimeStatus } from './RealtimeBadge'

export interface PlayerResult {
  id: string
  name: string
  hits: number
  misses: number
}

interface PlayerTotals {
  name: string
  totalScore: number
  totalMisses: number
  gamesPlayed: number
}

interface LeaderboardRealtimeProps {
  initialRows: PlayerResult[]
}

interface GameResultRealtimeRow {
  id: string
  playerName: string
  score: number
  misses: number
}

function isGameResultRealtimeRow(value: unknown): value is GameResultRealtimeRow {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.playerName === 'string' &&
    typeof candidate.score === 'number' &&
    typeof candidate.misses === 'number'
  )
}

function ratio(hits: number, misses: number): string {
  const total = hits + misses
  if (total === 0) return '0%'
  return `${Math.round((hits / total) * 100)}%`
}

function getPlayerTotals(rows: PlayerResult[]): PlayerTotals[] {
  const totalsByPlayer = new Map<string, PlayerTotals>()

  for (const row of rows) {
    const existingTotals = totalsByPlayer.get(row.name)
    if (existingTotals) {
      existingTotals.totalScore += row.hits
      existingTotals.totalMisses += row.misses
      existingTotals.gamesPlayed += 1
      continue
    }

    totalsByPlayer.set(row.name, {
      name: row.name,
      totalScore: row.hits,
      totalMisses: row.misses,
      gamesPlayed: 1,
    })
  }

  return [...totalsByPlayer.values()]
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="grid size-7 place-items-center rounded-full border border-amber-300/40 bg-amber-400/15 text-xs font-semibold text-amber-200">
        1
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="grid size-7 place-items-center rounded-full border border-slate-300/40 bg-slate-300/10 text-xs font-semibold text-slate-200">
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="grid size-7 place-items-center rounded-full border border-orange-300/40 bg-orange-400/10 text-xs font-semibold text-orange-200">
        3
      </span>
    )
  }
  return (
    <span className="grid size-7 place-items-center rounded-full border border-white/10 bg-white/3 text-xs font-medium text-zinc-300 tabular-nums">
      {rank}
    </span>
  )
}

function LeaderboardTable({
  title,
  subtitle,
  rows,
  highlightColumn,
  realtimeStatus,
}: {
  title: string
  subtitle: string
  rows: PlayerResult[]
  highlightColumn: 'hits' | 'misses'
  realtimeStatus: RealtimeStatus
}) {
  return (
    <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-sm">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-50">{title}</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-400">{subtitle}</p>
          </div>
          <RealtimeBadge status={realtimeStatus} />
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(7rem,1fr)_repeat(3,minmax(0,3.75rem))] gap-x-2 bg-zinc-900/70 px-5 py-2.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500" />
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Player</span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">Hits</span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Misses
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">Ratio</span>
      </div>

      <div className="divide-y divide-white/5 bg-zinc-950/50">
        {rows.map((player, i) => {
          const topThree = i < 3
          return (
            <div
              key={player.id}
              className="grid grid-cols-[auto_minmax(7rem,1fr)_repeat(3,minmax(0,3.75rem))] items-center gap-x-2 px-5 py-3 transition-colors hover:bg-white/3"
            >
              <div className="flex items-center justify-center">
                <RankBadge rank={i + 1} />
              </div>
              <span
                className={`truncate text-sm ${topThree ? 'font-medium text-zinc-100' : 'text-zinc-300'}`}
              >
                {player.name}
              </span>
              <span
                className={`text-right text-sm font-semibold tabular-nums ${
                  highlightColumn === 'hits' ? 'text-emerald-300' : 'text-zinc-300'
                }`}
              >
                {player.hits}
              </span>
              <span
                className={`text-right text-sm font-semibold tabular-nums ${
                  highlightColumn === 'misses' ? 'text-rose-300' : 'text-zinc-300'
                }`}
              >
                {player.misses}
              </span>
              <span className="text-right text-sm font-semibold tabular-nums text-sky-300">
                {ratio(player.hits, player.misses)}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TotalsTable({
  title,
  subtitle,
  rows,
  realtimeStatus,
}: {
  title: string
  subtitle: string
  rows: PlayerTotals[]
  realtimeStatus: RealtimeStatus
}) {
  return (
    <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-sm">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-50">{title}</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-400">{subtitle}</p>
          </div>
          <RealtimeBadge status={realtimeStatus} />
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(7rem,1fr)_repeat(3,minmax(0,4.25rem))] gap-x-2 bg-zinc-900/70 px-5 py-2.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500" />
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Player</span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Total Score
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Total Misses
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">Games</span>
      </div>

      <div className="divide-y divide-white/5 bg-zinc-950/50">
        {rows.map((player, i) => {
          const topThree = i < 3
          return (
            <div
              key={player.name}
              className="grid grid-cols-[auto_minmax(7rem,1fr)_repeat(3,minmax(0,4.25rem))] items-center gap-x-2 px-5 py-3 transition-colors hover:bg-white/3"
            >
              <div className="flex items-center justify-center">
                <RankBadge rank={i + 1} />
              </div>
              <span
                className={`truncate text-sm ${topThree ? 'font-medium text-zinc-100' : 'text-zinc-300'}`}
              >
                {player.name}
              </span>
              <span className="text-right text-sm font-semibold tabular-nums text-emerald-300">
                {player.totalScore}
              </span>
              <span className="text-right text-sm font-semibold tabular-nums text-rose-300">
                {player.totalMisses}
              </span>
              <span className="text-right text-sm font-semibold tabular-nums text-zinc-300">
                {player.gamesPlayed}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function LeaderboardRealtime({ initialRows }: LeaderboardRealtimeProps) {
  const [rows, setRows] = useState<PlayerResult[]>(initialRows)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')
  const [hasSwagBeenClicked, setHasSwagBeenClicked] = useState(false)
  const [hasCelebrationBeenClicked, setHasCelebrationBeenClicked] = useState(false)
  const [isSwagCheckoutEnabled, setIsSwagCheckoutEnabled] = useState(true)
  const [swagChannelReady, setSwagChannelReady] = useState(false)
  const swagChannelRef = useRef<RealtimeChannel | null>(null)
  const swagAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const celebrationAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSwagClick = async () => {
    setHasSwagBeenClicked(true)

    if (swagAnimationTimeoutRef.current) {
      clearTimeout(swagAnimationTimeoutRef.current)
    }

    swagAnimationTimeoutRef.current = setTimeout(() => {
      setHasSwagBeenClicked(false)
      swagAnimationTimeoutRef.current = null
    }, 5000)

    if (!swagChannelReady || !swagChannelRef.current) {
      return
    }

    await swagChannelRef.current.send({
      type: 'broadcast',
      event: SWAG_STORE_ENABLED_EVENT,
      payload: {
        showSwagStore: true,
      } satisfies SwagStoreBroadcastPayload,
    })
  }

  const handleSwagCheckoutToggle = async () => {
    const nextEnabled = !isSwagCheckoutEnabled
    setIsSwagCheckoutEnabled(nextEnabled)

    if (!swagChannelReady || !swagChannelRef.current) {
      return
    }

    await swagChannelRef.current.send({
      type: 'broadcast',
      event: SWAG_STORE_CHECKOUT_ENABLED_EVENT,
      payload: {
        enabled: nextEnabled,
      } satisfies SwagCheckoutBroadcastPayload,
    })
  }

  const handleSwagCelebrationClick = async () => {
    setHasCelebrationBeenClicked(true)

    if (celebrationAnimationTimeoutRef.current) {
      clearTimeout(celebrationAnimationTimeoutRef.current)
    }

    celebrationAnimationTimeoutRef.current = setTimeout(() => {
      setHasCelebrationBeenClicked(false)
      celebrationAnimationTimeoutRef.current = null
    }, 3000)

    if (!swagChannelReady || !swagChannelRef.current) {
      return
    }

    await swagChannelRef.current.send({
      type: 'broadcast',
      event: SWAG_STORE_CELEBRATION_EVENT,
      payload: {
        launchedAt: Date.now(),
      } satisfies SwagCelebrationBroadcastPayload,
    })
  }

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      return
    }

    let isMounted = true

    const resultsChannel = supabase.channel(GAME_RESULTS_LEADERBOARD_CHANNEL)
    const swagChannel = (swagChannelRef.current = supabase.channel(LEADERBOARD_SWAG_CHANNEL))

    const syncRows = async () => {
      const { data, error } = await supabase
        .from('game_results')
        .select('id, playerName, score, misses')

      if (error || !isMounted || !Array.isArray(data)) {
        return
      }

      const realtimeRows: PlayerResult[] = data.flatMap((value) => {
        if (!isGameResultRealtimeRow(value)) {
          return []
        }

        return [
          {
            id: value.id,
            name: value.playerName,
            hits: value.score,
            misses: value.misses,
          },
        ]
      })

      setRows(realtimeRows)
    }

    const statusesToResync = ['SUBSCRIBED', 'TIMED_OUT', 'CHANNEL_ERROR', 'CLOSED'] as const
    resultsChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_results' }, () => {
        void syncRows()
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('live')
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          setRealtimeStatus('offline')
        } else {
          setRealtimeStatus('connecting')
        }

        if (statusesToResync.includes(status)) {
          void syncRows()
        }
      })

    swagChannel.subscribe((status) => {
        setSwagChannelReady(status === 'SUBSCRIBED')
      })

    return () => {
      isMounted = false
      setRealtimeStatus('offline')
      setSwagChannelReady(false)
      if (swagAnimationTimeoutRef.current) {
        clearTimeout(swagAnimationTimeoutRef.current)
      }
      if (celebrationAnimationTimeoutRef.current) {
        clearTimeout(celebrationAnimationTimeoutRef.current)
      }
      swagChannelRef.current = null
      void resultsChannel.unsubscribe()
      void swagChannel.unsubscribe()
    }
  }, [])

  const playerTotals = useMemo(() => {
    return getPlayerTotals(rows)
  }, [rows])

  const byHits = useMemo(() => {
    return [...rows].sort((a, b) => b.hits - a.hits)
  }, [rows])

  const byMisses = useMemo(() => {
    return [...rows].sort((a, b) => b.misses - a.misses)
  }, [rows])

  const byTotalGames = useMemo(() => {
    return [...playerTotals].sort((a, b) => {
      if (b.gamesPlayed !== a.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed
      }

      return b.totalScore - a.totalScore
    })
  }, [playerTotals])

  const uniquePlayers = playerTotals.length
  const totalGamesPlayed = rows.length
  const mostHitsPlayer = useMemo(() => {
    return [...playerTotals].sort((a, b) => b.totalScore - a.totalScore)[0]
  }, [playerTotals])
  const mostMissesPlayer = useMemo(() => {
    return [...playerTotals].sort((a, b) => b.totalMisses - a.totalMisses)[0]
  }, [playerTotals])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300">
              Live Rankings
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void handleSwagClick()
                }}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                  hasSwagBeenClicked
                    ? 'animate-pulse border-emerald-300/45 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
                    : 'border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10'
                }`}
              >
                Swag
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleSwagCelebrationClick()
                }}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                  hasCelebrationBeenClicked
                    ? 'animate-pulse border-sky-300/45 bg-sky-400/15 text-sky-200 hover:bg-sky-400/25'
                    : 'border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10'
                }`}
              >
                Celebrate
              </button>

              <button
                type="button"
                onClick={() => {
                  void handleSwagCheckoutToggle()
                }}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                  isSwagCheckoutEnabled
                    ? 'border-emerald-300/45 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
                    : 'border-rose-300/45 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20'
                }`}
              >
                {isSwagCheckoutEnabled ? 'Enabled' : 'Disabled'}
              </button>

              <Link
                href="/qrcode"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/10"
              >
                QR Code
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                Leaderboard
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
                A clean snapshot of top whackers, accuracy, and who needs another run.
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PlayersCard
            uniquePlayers={uniquePlayers}
            totalGamesPlayed={totalGamesPlayed}
            realtimeStatus={realtimeStatus}
          />
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Most Hits</p>
              <RealtimeBadge status={realtimeStatus} />
            </div>
            <p className="mt-1 text-xl font-semibold text-zinc-50">
              {mostHitsPlayer ? (
                <>
                  {mostHitsPlayer.name} <span className="text-zinc-400">({mostHitsPlayer.totalScore})</span>
                </>
              ) : (
                <span className="text-zinc-400">No games yet</span>
              )}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Most Misses</p>
              <RealtimeBadge status={realtimeStatus} />
            </div>
            <p className="mt-1 text-xl font-semibold text-zinc-50">
              {mostMissesPlayer ? (
                <>
                  {mostMissesPlayer.name}{' '}
                  <span className="text-zinc-400">({mostMissesPlayer.totalMisses})</span>
                </>
              ) : (
                <span className="text-zinc-400">No games yet</span>
              )}
            </p>
          </div>
        </section>

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
          <LeaderboardTable
            title="Top Hitters"
            subtitle="Best individual game scores"
            rows={byHits}
            highlightColumn="hits"
            realtimeStatus={realtimeStatus}
          />

          <LeaderboardTable
            title="Most Misses"
            subtitle="Most misses in a single game"
            rows={byMisses}
            highlightColumn="misses"
            realtimeStatus={realtimeStatus}
          />

          <TotalsTable
            title="Total Games"
            subtitle="Games played and cumulative score"
            rows={byTotalGames}
            realtimeStatus={realtimeStatus}
          />
        </div>
      </div>
    </main>
  )
}
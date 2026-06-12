"use client";

import { type RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactCanvasConfetti from "react-canvas-confetti";
import { Toaster, toast } from "sonner";
import {
  assignConfettiLauncher,
  fireCelebrationConfetti,
  type ConfettiLauncher,
} from "@/lib/confetti";
import {
  ACTIVITY_TOAST_CONFIG,
  type ActivityTone,
} from "@/lib/activityToastConfig";
import {
  ACTIVE_GAMES_CHANNEL,
  GAME_RESULTS_LEADERBOARD_CHANNEL,
  LEADERBOARD_SWAG_ORDERS_CHANNEL,
  LEADERBOARD_SWAG_CHANNEL,
  type SwagCelebrationBroadcastPayload,
  type SwagCheckoutBroadcastPayload,
  type SwagStoreBroadcastPayload,
  SWAG_STORE_CELEBRATION_EVENT,
  SWAG_STORE_CHECKOUT_ENABLED_EVENT,
  SWAG_STORE_ENABLED_EVENT,
  getSupabaseBrowserClient,
} from "@/lib/supabaseBrowser";
import { PlayersCard } from "./PlayersCard";
import { RealtimeBadge, type RealtimeStatus } from "./RealtimeBadge";

export interface PlayerResult {
  id: string;
  name: string;
  hits: number;
  misses: number;
}

interface PlayerTotals {
  name: string;
  totalScore: number;
  totalMisses: number;
  gamesPlayed: number;
}

interface LeaderboardRealtimeProps {
  initialRows: PlayerResult[];
}

interface GameResultRealtimeRow {
  id: string;
  playerName: string;
  score: number;
  misses: number;
  disqualified: boolean;
}

interface SwagOrderRealtimeRow {
  id: string;
  status: string;
  playerName: string;
}

interface ActiveGamePresence {
  playerName?: unknown;
  startedAt?: unknown;
}

interface ActivityItem {
  id: string;
  tone: ActivityTone;
  title: string;
  detail: string;
  at: number;
}

function isGameResultRealtimeRow(
  value: unknown,
): value is GameResultRealtimeRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.playerName === "string" &&
    typeof candidate.score === "number" &&
    typeof candidate.misses === "number" &&
    typeof candidate.disqualified === "boolean"
  );
}

function isSwagOrderRealtimeRow(value: unknown): value is SwagOrderRealtimeRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.playerName === "string"
  );
}

function toPlayerResult(
  value: unknown,
  disqualifiedPlayers: Set<string>,
): PlayerResult | null {
  if (!isGameResultRealtimeRow(value)) {
    return null;
  }

  if (value.disqualified || disqualifiedPlayers.has(value.playerName)) {
    return null;
  }

  return {
    id: value.id,
    name: value.playerName,
    hits: value.score,
    misses: value.misses,
  };
}

function isActiveGamePresence(value: unknown): value is ActiveGamePresence {
  return Boolean(value) && typeof value === "object";
}

function formatActivityTime(timestampMs: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(timestampMs));
}

function upsertPlayerResult(
  currentRows: PlayerResult[],
  nextRow: PlayerResult,
): PlayerResult[] {
  const existingIndex = currentRows.findIndex((row) => row.id === nextRow.id);
  if (existingIndex === -1) {
    return [...currentRows, nextRow];
  }

  const nextRows = [...currentRows];
  nextRows[existingIndex] = nextRow;
  return nextRows;
}

function ratio(hits: number, misses: number): string {
  const total = hits + misses;
  if (total === 0) return "0%";
  return `${Math.round((hits / total) * 100)}%`;
}

function getPlayerTotals(rows: PlayerResult[]): PlayerTotals[] {
  const totalsByPlayer = new Map<string, PlayerTotals>();

  for (const row of rows) {
    const existingTotals = totalsByPlayer.get(row.name);
    if (existingTotals) {
      existingTotals.totalScore += row.hits;
      existingTotals.totalMisses += row.misses;
      existingTotals.gamesPlayed += 1;
      continue;
    }

    totalsByPlayer.set(row.name, {
      name: row.name,
      totalScore: row.hits,
      totalMisses: row.misses,
      gamesPlayed: 1,
    });
  }

  return [...totalsByPlayer.values()];
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="grid size-7 place-items-center rounded-full border border-amber-300/40 bg-amber-400/15 text-xs font-semibold text-amber-200">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="grid size-7 place-items-center rounded-full border border-slate-300/40 bg-slate-300/10 text-xs font-semibold text-slate-200">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="grid size-7 place-items-center rounded-full border border-orange-300/40 bg-orange-400/10 text-xs font-semibold text-orange-200">
        3
      </span>
    );
  }
  return (
    <span className="grid size-7 place-items-center rounded-full border border-white/10 bg-white/3 text-xs font-medium text-zinc-300 tabular-nums">
      {rank}
    </span>
  );
}

function LeaderboardTable({
  title,
  subtitle,
  rows,
  highlightColumn,
  realtimeStatus,
}: {
  title: string;
  subtitle: string;
  rows: PlayerResult[];
  highlightColumn: "hits" | "misses";
  realtimeStatus: RealtimeStatus;
}) {
  return (
    <section className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-sm">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-50">
              {title}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-400">
              {subtitle}
            </p>
          </div>
          <RealtimeBadge status={realtimeStatus} />
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(7rem,1fr)_repeat(3,minmax(0,3.75rem))] gap-x-2 bg-zinc-900/70 px-5 py-2.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500" />
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Player
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Hits
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Misses
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Ratio
        </span>
      </div>

      <div className="divide-y divide-white/5 bg-zinc-950/50">
        {rows.map((player, i) => {
          const topThree = i < 3;
          return (
            <div
              key={player.id}
              className="grid grid-cols-[auto_minmax(7rem,1fr)_repeat(3,minmax(0,3.75rem))] items-center gap-x-2 px-5 py-3 transition-colors hover:bg-white/3"
            >
              <div className="flex items-center justify-center">
                <RankBadge rank={i + 1} />
              </div>
              <span
                className={`truncate text-sm ${topThree ? "font-medium text-zinc-100" : "text-zinc-300"}`}
              >
                {player.name}
              </span>
              <span
                className={`text-right text-sm font-semibold tabular-nums ${
                  highlightColumn === "hits"
                    ? "text-emerald-300"
                    : "text-zinc-300"
                }`}
              >
                {player.hits}
              </span>
              <span
                className={`text-right text-sm font-semibold tabular-nums ${
                  highlightColumn === "misses"
                    ? "text-rose-300"
                    : "text-zinc-300"
                }`}
              >
                {player.misses}
              </span>
              <span className="text-right text-sm font-semibold tabular-nums text-sky-300">
                {ratio(player.hits, player.misses)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActivityTable({ rows }: { rows: ActivityItem[] }) {
  return (
    <section className="h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-sm">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-50">
          Live Activity
        </h2>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-400">
          Fast feed from games and swag events
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-7 text-sm text-zinc-400">
          Waiting for players to start.
        </div>
      ) : (
        <div className="divide-y divide-white/5 bg-zinc-950/50">
          {rows.map((event) => {
            const toneClass =
              event.tone === "emerald"
                ? "border-emerald-300/45 bg-emerald-400/10 text-emerald-200"
                : event.tone === "sky"
                  ? "border-sky-300/45 bg-sky-400/10 text-sky-200"
                  : event.tone === "amber"
                    ? "border-amber-300/45 bg-amber-400/10 text-amber-200"
                    : "border-rose-300/45 bg-rose-400/10 text-rose-200";

            return (
              <div
                key={event.id}
                className="flex items-start justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {event.title}
                  </p>
                  <p className="truncate text-sm text-zinc-300">
                    {event.detail}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${toneClass}`}
                >
                  {formatActivityTime(event.at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function LeaderboardRealtime({ initialRows }: LeaderboardRealtimeProps) {
  const [showHeaderButtons] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const params = new URLSearchParams(window.location.search);
    return params.get("buttons") === "true";
  });
  const [rows, setRows] = useState<PlayerResult[]>(initialRows);
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>("connecting");
  const [hasSwagBeenClicked, setHasSwagBeenClicked] = useState(false);
  const [hasCelebrationBeenClicked, setHasCelebrationBeenClicked] =
    useState(false);
  const [isSwagCheckoutEnabled, setIsSwagCheckoutEnabled] = useState(true);
  const [swagChannelReady, setSwagChannelReady] = useState(false);
  const [activeGamesInProgress, setActiveGamesInProgress] = useState(0);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const swagChannelRef = useRef<RealtimeChannel | null>(null);
  const confettiRef = useRef<ConfettiLauncher | null>(null);
  const disqualifiedPlayersRef = useRef<Set<string>>(new Set());
  const seenPresenceEventsRef = useRef<Set<string>>(new Set());
  const playerStartCountsRef = useRef<Map<string, number>>(new Map());
  const swagAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const celebrationAnimationTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleSwagClick = async () => {
    setHasSwagBeenClicked(true);

    if (swagAnimationTimeoutRef.current) {
      clearTimeout(swagAnimationTimeoutRef.current);
    }

    swagAnimationTimeoutRef.current = setTimeout(() => {
      setHasSwagBeenClicked(false);
      swagAnimationTimeoutRef.current = null;
    }, 5000);

    if (!swagChannelReady || !swagChannelRef.current) {
      return;
    }

    await swagChannelRef.current.send({
      type: "broadcast",
      event: SWAG_STORE_ENABLED_EVENT,
      payload: {
        showSwagStore: true,
      } satisfies SwagStoreBroadcastPayload,
    });
  };

  const handleSwagCheckoutToggle = async () => {
    const nextEnabled = !isSwagCheckoutEnabled;
    setIsSwagCheckoutEnabled(nextEnabled);

    if (!swagChannelReady || !swagChannelRef.current) {
      return;
    }

    await swagChannelRef.current.send({
      type: "broadcast",
      event: SWAG_STORE_CHECKOUT_ENABLED_EVENT,
      payload: {
        enabled: nextEnabled,
      } satisfies SwagCheckoutBroadcastPayload,
    });
  };

  const handleSwagCelebrationClick = async () => {
    setHasCelebrationBeenClicked(true);

    if (celebrationAnimationTimeoutRef.current) {
      clearTimeout(celebrationAnimationTimeoutRef.current);
    }

    celebrationAnimationTimeoutRef.current = setTimeout(() => {
      setHasCelebrationBeenClicked(false);
      celebrationAnimationTimeoutRef.current = null;
    }, 3000);

    if (!swagChannelReady || !swagChannelRef.current) {
      return;
    }

    await swagChannelRef.current.send({
      type: "broadcast",
      event: SWAG_STORE_CELEBRATION_EVENT,
      payload: {
        launchedAt: Date.now(),
      } satisfies SwagCelebrationBroadcastPayload,
    });
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let isMounted = true;

    const resultsChannel = supabase.channel(GAME_RESULTS_LEADERBOARD_CHANNEL);
    const swagChannel = (swagChannelRef.current = supabase.channel(
      LEADERBOARD_SWAG_CHANNEL,
    ));
    const swagOrdersChannel = supabase.channel(LEADERBOARD_SWAG_ORDERS_CHANNEL);
    const activeGamesChannel = supabase.channel(ACTIVE_GAMES_CHANNEL, {
      config: {
        presence: {
          key: `leaderboard-${crypto.randomUUID()}`,
        },
      },
    });

    const syncActiveGamesInProgress = () => {
      const presenceState = activeGamesChannel.presenceState();
      const gameCount = Object.values(presenceState).reduce(
        (total, sessions) => total + sessions.length,
        0,
      );
      setActiveGamesInProgress(gameCount);
    };

    const pushActivity = (item: Omit<ActivityItem, "id" | "at">) => {
      const toastConfig = ACTIVITY_TOAST_CONFIG[item.tone];
      toast(item.title, {
        description: item.detail,
        duration: toastConfig.duration,
        className: toastConfig.className,
      });

      setActivityItems((currentItems) => {
        const nextItem: ActivityItem = {
          ...item,
          id: crypto.randomUUID(),
          at: Date.now(),
        };

        return [nextItem, ...currentItems].slice(0, 18);
      });
    };

    const syncRows = async () => {
      // Fetch disqualified players
      const { data: disqualifiedData } = await supabase
        .from("game_results")
        .select("playerName")
        .eq("disqualified", true);

      if (Array.isArray(disqualifiedData)) {
        const disqualifiedSet = new Set(
          disqualifiedData
            .map((row) => (row as { playerName: unknown }).playerName)
            .filter((name): name is string => typeof name === "string"),
        );
        disqualifiedPlayersRef.current = disqualifiedSet;
      }

      const { data, error } = await supabase
        .from("game_results")
        .select("id, playerName, score, misses, disqualified")
        .eq("disqualified", false);

      if (error || !isMounted || !Array.isArray(data)) {
        return;
      }

      const realtimeRows: PlayerResult[] = data.flatMap((value) => {
        const row = toPlayerResult(value, disqualifiedPlayersRef.current);
        return row ? [row] : [];
      });

      setRows(realtimeRows);
    };

    const statusesToResync = [
      "SUBSCRIBED",
      "TIMED_OUT",
      "CHANNEL_ERROR",
      "CLOSED",
    ] as const;
    resultsChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_results" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const insertedRow = toPlayerResult(
              payload.new,
              disqualifiedPlayersRef.current,
            );
            if (insertedRow) {
              pushActivity({
                tone: "emerald",
                title: `${insertedRow.name} finished a game`,
                detail: `Score ${insertedRow.hits} • Misses ${insertedRow.misses}`,
              });
            }
          }

          const nextRow = toPlayerResult(
            payload.new,
            disqualifiedPlayersRef.current,
          );

          if (!nextRow) {
            // Check if this is a disqualification event
            if (
              payload.new &&
              typeof payload.new === "object" &&
              "playerName" in payload.new &&
              "disqualified" in payload.new
            ) {
              const playerData = payload.new as {
                playerName: unknown;
                disqualified: unknown;
              };
              if (
                typeof playerData.playerName === "string" &&
                playerData.disqualified === true
              ) {
                disqualifiedPlayersRef.current.add(playerData.playerName);
                pushActivity({
                  tone: "rose",
                  title: `${playerData.playerName} removed`,
                  detail: "Score disqualified from leaderboard",
                });
                // Remove all games for this disqualified player
                setRows((currentRows) =>
                  currentRows.filter((r) => r.name !== playerData.playerName),
                );
              }
            }
            return;
          }

          setRows((currentRows) => upsertPlayerResult(currentRows, nextRow));
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("live");
        } else if (
          status === "TIMED_OUT" ||
          status === "CHANNEL_ERROR" ||
          status === "CLOSED"
        ) {
          setRealtimeStatus("offline");
        } else {
          setRealtimeStatus("connecting");
        }

        if (statusesToResync.includes(status)) {
          void syncRows();
        }
      });

    swagChannel.subscribe((status) => {
      setSwagChannelReady(status === "SUBSCRIBED");
    });

    activeGamesChannel
      .on("presence", { event: "sync" }, () => {
        syncActiveGamesInProgress();
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        for (const presence of newPresences) {
          if (!isActiveGamePresence(presence)) {
            continue;
          }

          const startedAt =
            typeof presence.startedAt === "string" ? presence.startedAt : "";
          const eventSignature = `${key}:${startedAt}`;
          if (seenPresenceEventsRef.current.has(eventSignature)) {
            continue;
          }

          seenPresenceEventsRef.current.add(eventSignature);

          const rawName = presence.playerName;
          const playerName =
            typeof rawName === "string" && rawName.trim().length > 0
              ? rawName.trim()
              : "Anonymous player";

          const priorStarts = playerStartCountsRef.current.get(playerName) ?? 0;
          playerStartCountsRef.current.set(playerName, priorStarts + 1);

          pushActivity({
            tone: "sky",
            title:
              priorStarts > 0
                ? `${playerName} played again`
                : `${playerName} started playing`,
            detail:
              priorStarts > 0
                ? "Back for another run"
                : "New run is live on the game board",
          });
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          syncActiveGamesInProgress();
        }
      });

    swagOrdersChannel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "swag_orders" },
        (payload) => {
          if (!isSwagOrderRealtimeRow(payload.new)) {
            return;
          }

          if (payload.new.status === "pending") {
            pushActivity({
              tone: "amber",
              title: `${payload.new.playerName} started checkout`,
              detail: "Swag order is pending payment",
            });
          }

          if (payload.new.status === "paid") {
            pushActivity({
              tone: "emerald",
              title: `${payload.new.playerName} completed checkout`,
              detail: "Swag order paid",
            });
            fireCelebrationConfetti(confettiRef.current);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "swag_orders" },
        (payload) => {
          const nextRow = isSwagOrderRealtimeRow(payload.new)
            ? payload.new
            : null;

          if (!nextRow) {
            return;
          }

          if (nextRow.status === "paid") {
            pushActivity({
              tone: "emerald",
              title: `${nextRow.playerName} completed checkout`,
              detail: "Swag order paid",
            });
            fireCelebrationConfetti(confettiRef.current);
          }
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      setRealtimeStatus("offline");
      setSwagChannelReady(false);
      if (swagAnimationTimeoutRef.current) {
        clearTimeout(swagAnimationTimeoutRef.current);
      }
      if (celebrationAnimationTimeoutRef.current) {
        clearTimeout(celebrationAnimationTimeoutRef.current);
      }
      swagChannelRef.current = null;
      void resultsChannel.unsubscribe();
      void swagChannel.unsubscribe();
      void swagOrdersChannel.unsubscribe();
      void activeGamesChannel.unsubscribe();
    };
  }, []);

  const playerTotals = useMemo(() => {
    return getPlayerTotals(rows);
  }, [rows]);

  const byHits = useMemo(() => {
    return [...rows].sort((a, b) => b.hits - a.hits);
  }, [rows]);

  const uniquePlayers = playerTotals.length;
  const totalGamesPlayed = rows.length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <ReactCanvasConfetti
        className="pointer-events-none fixed inset-0 z-40"
        style={{ width: "100vw", height: "100vh" }}
        globalOptions={{ resize: true, useWorker: true }}
        onInit={({ confetti }) => {
          assignConfettiLauncher(confettiRef, confetti);
        }}
      />

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 9000,
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-4">
          {showHeaderButtons ? (
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300">
                Live Rankings
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void handleSwagClick();
                  }}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                    hasSwagBeenClicked
                      ? "animate-pulse border-emerald-300/45 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
                      : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
                  }`}
                >
                  Swag
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void handleSwagCelebrationClick();
                  }}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                    hasCelebrationBeenClicked
                      ? "animate-pulse border-sky-300/45 bg-sky-400/15 text-sky-200 hover:bg-sky-400/25"
                      : "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
                  }`}
                >
                  Celebrate
                </button>

                <button
                  type="button"
                  onClick={() => {
                    void handleSwagCheckoutToggle();
                  }}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                    isSwagCheckoutEnabled
                      ? "border-emerald-300/45 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
                      : "border-rose-300/45 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20"
                  }`}
                >
                  {isSwagCheckoutEnabled ? "Enabled" : "Disabled"}
                </button>

                <Link
                  href="/qrcode"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:bg-white/10"
                >
                  QR Code
                </Link>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                Leaderboard
              </h1>
              <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                A clean snapshot of top whackers, accuracy, and who needs
                another run. Have fun and play fair! While we appreciate a good
                hacker mindset, scores obtained through exploits, automation, or
                other unfair methods will be removed from the leaderboard.
              </p>
            </div>
          </div>
        </header>

        <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-3 xl:grid-rows-[auto_1fr]">
          <div className="xl:col-start-1 xl:row-start-1">
            <PlayersCard
              uniquePlayers={uniquePlayers}
              totalGamesPlayed={totalGamesPlayed}
              activeGames={activeGamesInProgress}
              realtimeStatus={realtimeStatus}
            />
          </div>

          <div className="rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-3 xl:col-start-2 xl:row-start-1 xl:h-[122px] xl:overflow-hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              iPad Air Prize
            </p>
            <p className="mt-1 text-lg font-semibold text-cyan-100">
              Giveaway at 4:00 PM today
            </p>
            <p className="mt-1 text-sm text-cyan-50/80">
              Play now before the 4:00 PM draw.
            </p>
          </div>

          <div className="xl:col-start-1 xl:row-start-2">
            <LeaderboardTable
              title="Top Hitters"
              subtitle="Top 10 scores today"
              rows={byHits.slice(0, 10)}
              highlightColumn="hits"
              realtimeStatus={realtimeStatus}
            />
          </div>

          <div className="xl:col-start-2 xl:row-start-2">
            <ActivityTable rows={activityItems} />
          </div>

          <section className="grid gap-6 xl:col-start-3 xl:row-start-1 xl:row-span-2">
            <article className="overflow-hidden rounded-2xl border border-cyan-300/35 bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Prize Spotlight
                </p>
                <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  4:00 PM Today
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-cyan-50">
                Win an iPad Air
              </h2>
              <p className="mt-1 text-sm text-cyan-50/80">
                Keep playing and climb the leaderboard for a shot at the booth
                giveaway.
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/20 bg-white/[0.04]">
                <video
                  className="h-full max-h-[240px] w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="iPad Air prize video"
                >
                  <source src="/ipad.mov" />
                  Your browser does not support this video format.
                </video>
              </div>
            </article>

            <article className="grid place-items-center rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-500/15 via-emerald-300/5 to-transparent p-4 sm:p-5">
              <div className="w-full max-w-xs overflow-hidden rounded-xl border border-white/20 bg-white p-3">
                <Image
                  src="/whack-a-mole-qr-code-paypal.png"
                  alt="QR code to play Whack-a-Mole"
                  width={640}
                  height={640}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}

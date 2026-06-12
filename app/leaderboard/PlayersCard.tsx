"use client";

import { useEffect, useState } from "react";
import {
  GAME_RESULTS_CHANNEL,
  getSupabaseBrowserClient,
} from "@/lib/supabaseBrowser";
import { RealtimeBadge, type RealtimeStatus } from "./RealtimeBadge";

interface PlayersCardProps {
  uniquePlayers: number;
  totalGamesPlayed: number;
  activeGames: number;
  realtimeStatus: RealtimeStatus;
}

export function PlayersCard({
  uniquePlayers,
  totalGamesPlayed,
  activeGames,
  realtimeStatus,
}: PlayersCardProps) {
  const [totalGamesPlayedCount, setTotalGamesPlayedCount] =
    useState(totalGamesPlayed);

  useEffect(() => {
    setTotalGamesPlayedCount(totalGamesPlayed);
  }, [totalGamesPlayed]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let isMounted = true;

    const gamesCountChannel = supabase.channel(GAME_RESULTS_CHANNEL);

    const syncTotalGamesPlayed = async () => {
      const { count, error } = await supabase
        .from("game_results")
        .select("id", { count: "exact", head: true });

      if (error || !isMounted || typeof count !== "number") {
        return;
      }

      setTotalGamesPlayedCount(count);
    };

    const statusesToResync = [
      "SUBSCRIBED",
      "TIMED_OUT",
      "CHANNEL_ERROR",
      "CLOSED",
    ] as const;
    gamesCountChannel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_results" },
        () => {
          setTotalGamesPlayedCount((currentCount) => currentCount + 1);
        },
      )
      .subscribe((status) => {
        if (statusesToResync.includes(status)) {
          void syncTotalGamesPlayed();
        }
      });

    return () => {
      isMounted = false;
      void gamesCountChannel.unsubscribe();
    };
  }, []);

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          Players
        </p>
        <RealtimeBadge status={realtimeStatus} />
      </div>
      <p className="mt-1 text-5xl font-semibold text-zinc-50">
        {uniquePlayers}
      </p>
      <div className="mt-auto flex items-center justify-between gap-4 pt-3 text-sm text-zinc-400">
        <p>
          Total games played:{" "}
          <span className="font-semibold text-zinc-200 tabular-nums">
            {totalGamesPlayedCount}
          </span>
        </p>
        <p className="text-right">
          Games in progress:{" "}
          <span className="font-semibold text-zinc-200 tabular-nums">
            {activeGames}
          </span>
        </p>
      </div>
    </div>
  );
}

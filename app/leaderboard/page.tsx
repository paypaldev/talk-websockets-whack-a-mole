import { prisma } from "@/lib/prisma";
import { PlayersCard } from "./PlayersCard";

interface PlayerResult {
  id: string;
  name: string;
  hits: number;
  misses: number;
}

interface LeaderboardRowRecord {
  id: string;
  playerName: string;
  score: number;
  misses: number;
}

interface PlayerTotals {
  name: string;
  totalScore: number;
  totalMisses: number;
  gamesPlayed: number;
}

interface PlayerTotalsRecord {
  playerName: string;
  _sum: {
    misses: number | null;
    score: number | null;
  };
  _count: {
    _all: number;
  };
}

function ratio(hits: number, misses: number): string {
  const total = hits + misses;
  if (total === 0) return "0%";
  return `${Math.round((hits / total) * 100)}%`;
}

async function getLeaderboardRows(): Promise<PlayerResult[]> {
  const results = await prisma.gameResult.findMany({
    select: {
      id: true,
      playerName: true,
      score: true,
      misses: true,
    },
  });

  return results.map((result: LeaderboardRowRecord) => ({
    id: result.id,
    name: result.playerName,
    hits: result.score,
    misses: result.misses,
  }));
}

async function getPlayerTotals(): Promise<PlayerTotals[]> {
  const groupedResults = await prisma.gameResult.groupBy({
    by: ["playerName"],
    _sum: {
      misses: true,
      score: true,
    },
    _count: {
      _all: true,
    },
  });

  return groupedResults.map((result: PlayerTotalsRecord) => ({
    name: result.playerName,
    totalScore: result._sum.score ?? 0,
    totalMisses: result._sum.misses ?? 0,
    gamesPlayed: result._count._all,
  }));
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
}: {
  title: string;
  subtitle: string;
  rows: PlayerResult[];
  highlightColumn: "hits" | "misses";
}) {
  return (
    <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-sm">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-50">{title}</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-400">
          {subtitle}
        </p>
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
                  highlightColumn === "hits" ? "text-emerald-300" : "text-zinc-300"
                }`}
              >
                {player.hits}
              </span>
              <span
                className={`text-right text-sm font-semibold tabular-nums ${
                  highlightColumn === "misses" ? "text-rose-300" : "text-zinc-300"
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

function TotalsTable({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: PlayerTotals[];
}) {
  return (
    <section className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-sm">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-50">{title}</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-400">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-[auto_minmax(7rem,1fr)_repeat(3,minmax(0,4.25rem))] gap-x-2 bg-zinc-900/70 px-5 py-2.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500" />
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Player
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Total Score
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Total Misses
        </span>
        <span className="text-right text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          Games
        </span>
      </div>

      <div className="divide-y divide-white/5 bg-zinc-950/50">
        {rows.map((player, i) => {
          const topThree = i < 3;
          return (
            <div
              key={player.name}
              className="grid grid-cols-[auto_minmax(7rem,1fr)_repeat(3,minmax(0,4.25rem))] items-center gap-x-2 px-5 py-3 transition-colors hover:bg-white/3"
            >
              <div className="flex items-center justify-center">
                <RankBadge rank={i + 1} />
              </div>
              <span
                className={`truncate text-sm ${topThree ? "font-medium text-zinc-100" : "text-zinc-300"}`}
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
          );
        })}
      </div>
    </section>
  );
}

export default async function LeaderboardPage() {
  const [rows, playerTotals] = await Promise.all([getLeaderboardRows(), getPlayerTotals()]);
  const byHits = [...rows].sort((a, b) => b.hits - a.hits);
  const byMisses = [...rows].sort((a, b) => b.misses - a.misses);
  const byTotalGames = [...playerTotals].sort((a, b) => {
    if (b.gamesPlayed !== a.gamesPlayed) {
      return b.gamesPlayed - a.gamesPlayed;
    }
    return b.totalScore - a.totalScore;
  });

  const uniquePlayers = playerTotals.length;
  const mostHitsPlayer = [...playerTotals].sort((a, b) => b.totalScore - a.totalScore)[0];
  const mostMissesPlayer = [...playerTotals].sort((a, b) => b.totalMisses - a.totalMisses)[0];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300">
            Live Rankings
          </span>

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
          <PlayersCard uniquePlayers={uniquePlayers} />
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Most Hits</p>
            <p className="mt-1 text-xl font-semibold text-zinc-50">
              {mostHitsPlayer ? (
                <>
                  {mostHitsPlayer.name}{" "}
                  <span className="text-zinc-400">
                    ({mostHitsPlayer.totalScore})
                  </span>
                </>
              ) : (
                <span className="text-zinc-400">No games yet</span>
              )}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Most Misses</p>
            <p className="mt-1 text-xl font-semibold text-zinc-50">
              {mostMissesPlayer ? (
                <>
                  {mostMissesPlayer.name}{" "}
                  <span className="text-zinc-400">
                    ({mostMissesPlayer.totalMisses})
                  </span>
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
          />

          <LeaderboardTable
            title="Most Misses"
            subtitle="Most misses in a single game"
            rows={byMisses}
            highlightColumn="misses"
          />

          <TotalsTable
            title="Total Games"
            subtitle="Games played and cumulative score"
            rows={byTotalGames}
          />
        </div>
      </div>
    </main>
  );
}

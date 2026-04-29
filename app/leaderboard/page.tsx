import Link from "next/link";

interface PlayerResult {
  name: string;
  hits: number;
  misses: number;
}

const MOCK_RESULTS: PlayerResult[] = [
  { name: "Sarah K.",    hits: 42, misses: 8  },
  { name: "Marcus T.",   hits: 38, misses: 14 },
  { name: "Priya N.",    hits: 35, misses: 5  },
  { name: "Jordan L.",   hits: 31, misses: 19 },
  { name: "Devon C.",    hits: 28, misses: 11 },
  { name: "Aaliyah M.",  hits: 24, misses: 22 },
  { name: "Tomás R.",    hits: 19, misses: 7  },
  { name: "Wei Z.",      hits: 15, misses: 30 },
  { name: "Fatima A.",   hits: 12, misses: 3  },
  { name: "Kenji O.",    hits: 9,  misses: 41 },
];

function ratio(hits: number, misses: number): string {
  const total = hits + misses;
  if (total === 0) return "0%";
  return `${Math.round((hits / total) * 100)}%`;
}

function ratioValue(hits: number, misses: number): number {
  const total = hits + misses;
  if (total === 0) return 0;
  return Math.round((hits / total) * 100);
}

const byHits = [...MOCK_RESULTS].sort((a, b) => b.hits - a.hits);
const byMisses = [...MOCK_RESULTS].sort((a, b) => b.misses - a.misses);
const averageAccuracy = Math.round(
  MOCK_RESULTS.reduce((sum, player) => sum + ratioValue(player.hits, player.misses), 0) /
    MOCK_RESULTS.length,
);
const bestAccuracy = [...MOCK_RESULTS].sort(
  (a, b) => ratioValue(b.hits, b.misses) - ratioValue(a.hits, a.misses),
)[0];

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

      <div className="grid grid-cols-[auto_1fr_repeat(3,minmax(0,5rem))] gap-x-4 bg-zinc-900/70 px-5 py-2.5">
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
              key={player.name}
              className="grid grid-cols-[auto_1fr_repeat(3,minmax(0,5rem))] items-center gap-x-4 px-5 py-3 transition-colors hover:bg-white/3"
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

export default function LeaderboardPage() {
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
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Players</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-50">{MOCK_RESULTS.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Avg Accuracy</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-50">{averageAccuracy}%</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Best Precision</p>
            <p className="mt-1 text-xl font-semibold text-zinc-50">
              {bestAccuracy.name} <span className="text-zinc-400">({ratio(bestAccuracy.hits, bestAccuracy.misses)})</span>
            </p>
          </div>
        </section>

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          <LeaderboardTable
            title="Top Hitters"
            subtitle="Highest moles whacked"
            rows={byHits}
            highlightColumn="hits"
          />

          <LeaderboardTable
            title="Most Misses"
            subtitle="Highest misses recorded"
            rows={byMisses}
            highlightColumn="misses"
          />
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-white/15 bg-white/3 px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/9"
          >
            Play Again
          </Link>
        </div>
      </div>
    </main>
  );
}

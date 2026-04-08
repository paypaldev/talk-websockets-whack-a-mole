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

const byHits = [...MOCK_RESULTS].sort((a, b) => b.hits - a.hits);
const byMisses = [...MOCK_RESULTS].sort((a, b) => b.misses - a.misses);

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="text-sm font-bold text-[#009CDE] tabular-nums w-5 text-center">
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
    <section
      className="w-full rounded-3xl overflow-hidden"
      style={{ boxShadow: "0 8px 32px rgba(0,28,100,0.4)" }}
    >
      {/* Header */}
      <div
        className="px-6 py-5"
        style={{
          background:
            "linear-gradient(135deg, #FFD140 0%, #FFC439 60%, #E5A800 100%)",
        }}
      >
        <h2 className="text-xl font-black text-[#001C64] tracking-tight">{title}</h2>
        <p className="text-xs font-semibold text-[#003087] uppercase tracking-widest mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-[auto_1fr_repeat(3,minmax(0,5rem))] gap-x-4 px-5 py-2"
        style={{ background: "#002470" }}
      >
        <span className="text-[10px] font-bold text-[#009CDE] uppercase tracking-widest w-5" />
        <span className="text-[10px] font-bold text-[#009CDE] uppercase tracking-widest">
          Player
        </span>
        <span className="text-[10px] font-bold text-[#00C853] uppercase tracking-widest text-right">
          Hits
        </span>
        <span className="text-[10px] font-bold text-[#ff4d4d] uppercase tracking-widest text-right">
          Misses
        </span>
        <span className="text-[10px] font-bold text-[#FFC439] uppercase tracking-widest text-right">
          Ratio
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#002470]" style={{ background: "#001C64" }}>
        {rows.map((player, i) => {
          const isHighlighted = i < 3;
          return (
            <div
              key={player.name}
              className={`grid grid-cols-[auto_1fr_repeat(3,minmax(0,5rem))] gap-x-4 items-center px-5 py-3 transition-colors ${
                isHighlighted ? "bg-[#001C64]" : ""
              }`}
            >
              <div className="flex items-center justify-center w-5">
                <RankBadge rank={i + 1} />
              </div>
              <span
                className={`text-sm font-semibold truncate ${
                  isHighlighted ? "text-white" : "text-[#9DB8D9]"
                }`}
              >
                {player.name}
              </span>
              <span
                className={`text-sm font-bold tabular-nums text-right ${
                  highlightColumn === "hits"
                    ? "text-[#00C853]"
                    : "text-[#9DB8D9]"
                }`}
              >
                {player.hits}
              </span>
              <span
                className={`text-sm font-bold tabular-nums text-right ${
                  highlightColumn === "misses"
                    ? "text-[#ff4d4d]"
                    : "text-[#9DB8D9]"
                }`}
              >
                {player.misses}
              </span>
              <span className="text-sm font-bold tabular-nums text-right text-[#FFC439]">
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
    <main
      className="flex flex-1 flex-col items-center gap-10 px-4 py-10"
      style={{
        background:
          "linear-gradient(150deg, #001C64 0%, #003087 55%, #0070BA 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Page title */}
      <div className="text-center">
        <p className="text-4xl mb-2">🏆</p>
        <h1 className="text-3xl font-black text-[#FFC439] tracking-tight">
          Leaderboard
        </h1>
        <p className="text-[#009CDE] text-sm mt-1 uppercase tracking-widest font-semibold">
          Whack-a-Mole Champions
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <Link
        href="/"
        className="mt-2 px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest text-[#001C64] transition-opacity hover:opacity-90 active:opacity-75"
        style={{
          background:
            "linear-gradient(180deg, #FFD140 0%, #FFC439 60%, #E5A800 100%)",
          boxShadow: "0 4px 16px rgba(255,196,57,0.4)",
        }}
      >
        Play Again
      </Link>
    </main>
  );
}

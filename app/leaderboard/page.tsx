import { prisma } from "@/lib/prisma";
import { LeaderboardRealtime, type PlayerResult } from "./LeaderboardRealtime";

interface LeaderboardRowRecord {
  id: string;
  playerName: string;
  score: number;
  misses: number;
}

async function getLeaderboardRows(): Promise<PlayerResult[]> {
  const bannedNames = await prisma.disqualifiedName.findMany({
    select: { name: true },
  });

  const bannedLower = bannedNames.map((r) => r.name.toLowerCase());

  const results = await prisma.gameResult.findMany({
    where: {
      disqualified: false,
    },
    select: {
      id: true,
      playerName: true,
      score: true,
      misses: true,
    },
  });

  return results
    .filter((r) => !bannedLower.includes(r.playerName.toLowerCase()))
    .map((result: LeaderboardRowRecord) => ({
      id: result.id,
      name: result.playerName,
      hits: result.score,
      misses: result.misses,
    }));
}

export default async function LeaderboardPage() {
  const rows = await getLeaderboardRows();

  return <LeaderboardRealtime initialRows={rows} />;
}

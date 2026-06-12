import { prisma } from "@/lib/prisma";
import { LeaderboardRealtime, type PlayerResult } from "./LeaderboardRealtime";

interface LeaderboardRowRecord {
  id: string;
  playerName: string;
  score: number;
  misses: number;
}

interface DisqualifiedPlayerRecord {
  playerName: string;
}

async function getLeaderboardRows(): Promise<PlayerResult[]> {
  const disqualifiedPlayers = await prisma.gameResult.findMany({
    where: {
      disqualified: true,
    },
    select: {
      playerName: true,
    },
    distinct: ["playerName"],
  });

  const disqualifiedPlayerNames = disqualifiedPlayers.map(
    (result: DisqualifiedPlayerRecord) => result.playerName,
  );

  const results = await prisma.gameResult.findMany({
    where: {
      disqualified: false,
      ...(disqualifiedPlayerNames.length > 0
        ? {
            playerName: {
              notIn: disqualifiedPlayerNames,
            },
          }
        : {}),
    },
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

export default async function LeaderboardPage() {
  const rows = await getLeaderboardRows();

  return <LeaderboardRealtime initialRows={rows} />;
}

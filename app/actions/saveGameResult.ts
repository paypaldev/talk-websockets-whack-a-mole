"use server";

import { createHash, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validatePlayerName } from "@/lib/playerName";
import { getAntiCheatConfig } from "@/lib/antiCheatConfig";

interface SaveGameResultInput {
  sessionId?: string;
  sessionToken?: string;
  playerName: string;
  score: number;
  misses: number;
}

interface ValidatedSaveGameResultInput {
  sessionId: string | null;
  sessionToken: string | null;
  playerName: string;
  score: number;
  misses: number;
}

function validateInput(
  input: SaveGameResultInput,
  antiCheatEnabled: boolean,
  maxScorePerGame: number,
): ValidatedSaveGameResultInput {
  const sessionId = input.sessionId?.trim() ?? "";
  const sessionToken = input.sessionToken?.trim() ?? "";
  const playerName = validatePlayerName(input.playerName);

  if (antiCheatEnabled) {
    if (sessionId.length === 0) {
      throw new Error("sessionId is required.");
    }

    if (sessionId.length > 191) {
      throw new Error("sessionId must be 191 characters or fewer.");
    }

    if (sessionToken.length === 0) {
      throw new Error("sessionToken is required.");
    }

    if (sessionToken.length > 191) {
      throw new Error("sessionToken must be 191 characters or fewer.");
    }
  }

  if (!Number.isInteger(input.score) || input.score < 0) {
    throw new Error("score must be a non-negative integer.");
  }

  if (input.score > maxScorePerGame) {
    throw new Error("Score exceeds the maximum possible for a single game.");
  }

  if (!Number.isInteger(input.misses) || input.misses < 0) {
    throw new Error("misses must be a non-negative integer.");
  }

  return {
    sessionId: antiCheatEnabled ? sessionId : null,
    sessionToken: antiCheatEnabled ? sessionToken : null,
    playerName,
    score: input.score,
    misses: input.misses,
  };
}

function hashSessionToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

function areHashesEqual(expectedHex: string, providedHex: string): boolean {
  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const providedBuffer = Buffer.from(providedHex, "hex");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function saveGameResultAction(input: SaveGameResultInput) {
  const antiCheatConfig = getAntiCheatConfig();
  const validated = validateInput(input, antiCheatConfig.enabled, antiCheatConfig.maxScorePerGame);

  const autoDisqualified =
    antiCheatConfig.disqualifyZeroMisses &&
    validated.misses === 0 &&
    validated.score > 0;

  if (!antiCheatConfig.enabled) {
    const createdResult = await prisma.gameResult.create({
      data: {
        playerName: validated.playerName,
        score: validated.score,
        misses: validated.misses,
        disqualified: autoDisqualified,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    revalidatePath("/leaderboard");

    return createdResult;
  }

  if (!validated.sessionId || !validated.sessionToken) {
    throw new Error("Game session is required.");
  }

  const session = await prisma.gameSession.findUnique({
    where: {
      id: validated.sessionId,
    },
    select: {
      id: true,
      playerName: true,
      sessionTokenHash: true,
      createdAt: true,
      expiresAt: true,
      consumedAt: true,
    },
  });

  if (!session) {
    throw new Error("Invalid game session.");
  }

  if (session.playerName !== validated.playerName) {
    throw new Error("Game session does not match player.");
  }

  if (session.consumedAt) {
    throw new Error("Game session already used.");
  }

  const now = new Date();
  if (session.expiresAt <= now) {
    throw new Error("Game session expired.");
  }

  const elapsedMs = now.getTime() - session.createdAt.getTime();
  if (elapsedMs < antiCheatConfig.minGameDurationMs) {
    throw new Error("Game session finished too quickly.");
  }

  const providedTokenHash = hashSessionToken(validated.sessionToken);
  if (!areHashesEqual(session.sessionTokenHash, providedTokenHash)) {
    throw new Error("Invalid game session token.");
  }

  const createdResult = await prisma.$transaction(async (transaction) => {
    const consumedSession = await transaction.gameSession.updateMany({
      where: {
        id: session.id,
        consumedAt: null,
      },
      data: {
        consumedAt: now,
      },
    });

    if (consumedSession.count !== 1) {
      throw new Error("Game session already used.");
    }

    return transaction.gameResult.create({
      data: {
        playerName: validated.playerName,
        score: validated.score,
        misses: validated.misses,
        disqualified: autoDisqualified,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  });

  revalidatePath("/leaderboard");

  return createdResult;
}

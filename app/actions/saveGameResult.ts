"use server";

import { createHash, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validatePlayerName } from "@/lib/playerName";
import { getAntiCheatConfig } from "@/lib/antiCheatConfig";

const HOLE_COUNT = 9;
const PAYPAL_BONUS_POINTS = 10;

type WhackAttemptOutcome = "hit_mole" | "hit_paypal" | "miss";

interface WhackAttemptInput {
  holeIndex: number;
  occurredAtMs: number;
  outcome: WhackAttemptOutcome;
}

interface SaveGameResultInput {
  sessionId?: string;
  sessionToken?: string;
  playerName: string;
  attempts: WhackAttemptInput[];
}

interface ValidatedSaveGameResultInput {
  sessionId: string | null;
  sessionToken: string | null;
  playerName: string;
  attempts: WhackAttemptInput[];
}

interface AuthoritativeResult {
  score: number;
  misses: number;
}

function isWhackAttemptOutcome(value: string): value is WhackAttemptOutcome {
  return value === "hit_mole" || value === "hit_paypal" || value === "miss";
}

function normalizeAttempt(
  attempt: WhackAttemptInput,
  index: number,
): WhackAttemptInput {
  if (!Number.isInteger(attempt.holeIndex)) {
    throw new Error(`attempt[${index}].holeIndex must be an integer.`);
  }

  if (attempt.holeIndex < 0 || attempt.holeIndex >= HOLE_COUNT) {
    throw new Error(`attempt[${index}].holeIndex is out of range.`);
  }

  if (!Number.isInteger(attempt.occurredAtMs)) {
    throw new Error(`attempt[${index}].occurredAtMs must be an integer.`);
  }

  if (attempt.occurredAtMs < 0) {
    throw new Error(`attempt[${index}].occurredAtMs must be non-negative.`);
  }

  if (!isWhackAttemptOutcome(attempt.outcome)) {
    throw new Error(`attempt[${index}].outcome is invalid.`);
  }

  return {
    holeIndex: attempt.holeIndex,
    occurredAtMs: attempt.occurredAtMs,
    outcome: attempt.outcome,
  };
}

function computeAuthoritativeResult(
  attempts: readonly WhackAttemptInput[],
  maxScorePerGame: number,
): AuthoritativeResult {
  let score = 0;
  let misses = 0;

  for (const attempt of attempts) {
    if (attempt.outcome === "hit_mole") {
      score += 1;
      continue;
    }

    if (attempt.outcome === "hit_paypal") {
      score += PAYPAL_BONUS_POINTS;
      continue;
    }

    misses += 1;
  }

  if (score > maxScorePerGame) {
    throw new Error("Score exceeds the maximum possible for a single game.");
  }

  return {
    score,
    misses,
  };
}

function validateInput(
  input: SaveGameResultInput,
  antiCheatEnabled: boolean,
  maxScorePerGame: number,
  maxAttemptsPerGame: number,
): ValidatedSaveGameResultInput {
  const sessionId = input.sessionId?.trim() ?? "";
  const sessionToken = input.sessionToken?.trim() ?? "";
  const playerName = validatePlayerName(input.playerName);

  if (!Array.isArray(input.attempts)) {
    throw new Error("attempts must be an array.");
  }

  if (input.attempts.length === 0) {
    throw new Error("attempts cannot be empty.");
  }

  if (input.attempts.length > maxAttemptsPerGame) {
    throw new Error("Too many attempts submitted for a single game.");
  }

  const attempts = input.attempts.map((attempt, index) =>
    normalizeAttempt(attempt, index),
  );

  for (let i = 1; i < attempts.length; i += 1) {
    if (attempts[i].occurredAtMs < attempts[i - 1].occurredAtMs) {
      throw new Error("attempts must be sorted by occurredAtMs.");
    }
  }

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

  const { score, misses } = computeAuthoritativeResult(attempts, maxScorePerGame);

  if (!Number.isInteger(score) || score < 0) {
    throw new Error("Invalid score computed from attempts.");
  }

  if (!Number.isInteger(misses) || misses < 0) {
    throw new Error("Invalid misses computed from attempts.");
  }

  return {
    sessionId: antiCheatEnabled ? sessionId : null,
    sessionToken: antiCheatEnabled ? sessionToken : null,
    playerName,
    attempts,
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
  const validated = validateInput(
    input,
    antiCheatConfig.enabled,
    antiCheatConfig.maxScorePerGame,
    antiCheatConfig.maxAttemptsPerGame,
  );
  const authoritativeResult = computeAuthoritativeResult(
    validated.attempts,
    antiCheatConfig.maxScorePerGame,
  );

  const autoDisqualified =
    antiCheatConfig.disqualifyZeroMisses &&
    authoritativeResult.misses === 0 &&
    authoritativeResult.score > 0;

  if (!antiCheatConfig.enabled) {
    const createdResult = await prisma.gameResult.create({
      data: {
        playerName: validated.playerName,
        score: authoritativeResult.score,
        misses: authoritativeResult.misses,
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
        score: authoritativeResult.score,
        misses: authoritativeResult.misses,
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

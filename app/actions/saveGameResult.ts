"use server";

import { createHash, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validatePlayerName } from "@/lib/playerName";
import { getAntiCheatConfig } from "@/lib/antiCheatConfig";

const HOLE_COUNT = 9;
const PAYPAL_BONUS_POINTS = 10;
// Game is 60 s; allow 2 s of clock drift/network latency before rejecting.
const GAME_DURATION_MS = 60_000;
const CLOCK_DRIFT_BUFFER_MS = 2_000;

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

/**
 * Hard-reject impossible timing patterns that cannot occur with real input.
 * Returns a rejection reason string on failure, null on pass.
 */
function findImpossibleTimingViolation(
  attempts: readonly WhackAttemptInput[],
  minInterAttemptMs: number,
): string | null {
  const maxTimestamp = GAME_DURATION_MS + CLOCK_DRIFT_BUFFER_MS;

  for (let i = 0; i < attempts.length; i += 1) {
    if (attempts[i].occurredAtMs > maxTimestamp) {
      return `attempt timestamp ${attempts[i].occurredAtMs}ms exceeds game duration ${maxTimestamp}ms.`;
    }
  }

  for (let i = 1; i < attempts.length; i += 1) {
    const gap = attempts[i].occurredAtMs - attempts[i - 1].occurredAtMs;
    if (gap < minInterAttemptMs) {
      return `consecutive attempts ${gap}ms apart are too fast to be human input (minimum ${minInterAttemptMs}ms).`;
    }
  }

  return null;
}

interface SuspiciousPatternResult {
  disqualify: boolean;
  reasons: string[];
}

/**
 * Detect behavioural patterns associated with automation.
 * Returns disqualify=true when the session should be flagged rather than
 * hard-rejected, so legitimate edge cases are preserved for manual review.
 */
function detectSuspiciousPatterns(
  attempts: readonly WhackAttemptInput[],
  maxHitsPerSecondWindow: number,
): SuspiciousPatternResult {
  const reasons: string[] = [];

  // --- Burst detection (sliding window) ---
  const hits = attempts.filter(
    (a) => a.outcome === "hit_mole" || a.outcome === "hit_paypal",
  );

  let windowStart = 0;
  for (let i = 0; i < hits.length; i += 1) {
    while (hits[i].occurredAtMs - hits[windowStart].occurredAtMs > 1_000) {
      windowStart += 1;
    }
    const hitsInWindow = i - windowStart + 1;
    if (hitsInWindow > maxHitsPerSecondWindow) {
      reasons.push(
        `${hitsInWindow} hits recorded within a single second.`,
      );
      break;
    }
  }

  // --- Regularity detection ---
  // A bot clicking at fixed intervals produces near-zero variance in gaps.
  // Only meaningful with enough data points.
  if (attempts.length > 10) {
    const gaps: number[] = [];
    for (let i = 1; i < attempts.length; i += 1) {
      gaps.push(attempts[i].occurredAtMs - attempts[i - 1].occurredAtMs);
    }
    const mean = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
    const variance =
      gaps.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / gaps.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

    // CV < 0.05 with a fast mean cadence is a strong bot signal.
    if (coefficientOfVariation < 0.05 && mean < 500) {
      reasons.push(
        "click timing is suspiciously regular (possible automation).",
      );
    }
  }

  return {
    disqualify: reasons.length > 0,
    reasons,
  };
}

// Validates only structural correctness — data types, array shape, sort order.
// Game-level checks (timing, session) are handled in saveGameResultAction so
// they can be saved as disqualified records instead of throwing.
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

  const { reasons: behavioralReasons } = detectSuspiciousPatterns(
    validated.attempts,
    antiCheatConfig.maxHitsPerSecondWindow,
  );

  const disqualificationReasons: string[] = [...behavioralReasons];

  if (
    antiCheatConfig.disqualifyZeroMisses &&
    authoritativeResult.misses === 0 &&
    authoritativeResult.score > 0
  ) {
    disqualificationReasons.push("zero misses with non-zero score.");
  }

  // Defined early so timing and session checks below can use it.
  const saveDisqualifiedAudit = async (reason: string) => {
    const allReasons = [...disqualificationReasons, reason];
    const result = await prisma.gameResult.create({
      data: {
        playerName: validated.playerName,
        score: authoritativeResult.score,
        misses: authoritativeResult.misses,
        disqualified: true,
        disqualificationReason: allReasons.join(" "),
      },
      select: {
        id: true,
        createdAt: true,
        disqualified: true,
      },
    });
    revalidatePath("/leaderboard");
    return result;
  };

  if (validated.attempts.length === 0) {
    return saveDisqualifiedAudit("No attempts submitted.");
  }

  const bannedEntry = await prisma.disqualifiedName.findFirst({
    where: { name: { equals: validated.playerName, mode: "insensitive" } },
    select: { name: true },
  });
  if (bannedEntry) {
    return saveDisqualifiedAudit("Player name is on the disqualification list.");
  }

  // Timing check: moved out of validateInput so violations are saved, not thrown.
  const timingViolation = findImpossibleTimingViolation(
    validated.attempts,
    antiCheatConfig.minInterAttemptMs,
  );
  if (timingViolation) {
    return saveDisqualifiedAudit(timingViolation);
  }

  const autoDisqualified = disqualificationReasons.length > 0;
  const disqualificationReason = autoDisqualified
    ? disqualificationReasons.join(" ")
    : null;

  if (!antiCheatConfig.enabled) {
    const createdResult = await prisma.gameResult.create({
      data: {
        playerName: validated.playerName,
        score: authoritativeResult.score,
        misses: authoritativeResult.misses,
        disqualified: autoDisqualified,
        disqualificationReason,
      },
      select: {
        id: true,
        createdAt: true,
        disqualified: true,
      },
    });

    revalidatePath("/leaderboard");

    return createdResult;
  }

  if (!validated.sessionId || !validated.sessionToken) {
    return saveDisqualifiedAudit("Session ID or token missing.");
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
    return saveDisqualifiedAudit("Game session not found.");
  }

  if (session.playerName !== validated.playerName) {
    return saveDisqualifiedAudit("Game session does not match player name.");
  }

  if (session.consumedAt) {
    return saveDisqualifiedAudit("Game session already used.");
  }

  const now = new Date();
  if (session.expiresAt <= now) {
    return saveDisqualifiedAudit("Game session expired.");
  }

  const elapsedMs = now.getTime() - session.createdAt.getTime();
  if (elapsedMs < antiCheatConfig.minGameDurationMs) {
    return saveDisqualifiedAudit(
      `Game finished too quickly (${elapsedMs}ms elapsed, minimum ${antiCheatConfig.minGameDurationMs}ms required).`,
    );
  }

  const providedTokenHash = hashSessionToken(validated.sessionToken);
  if (!areHashesEqual(session.sessionTokenHash, providedTokenHash)) {
    return saveDisqualifiedAudit("Session token hash mismatch.");
  }

  try {
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
        throw new Error("CONCURRENT_CONSUMED");
      }

      return transaction.gameResult.create({
        data: {
          playerName: validated.playerName,
          score: authoritativeResult.score,
          misses: authoritativeResult.misses,
          disqualified: autoDisqualified,
          disqualificationReason,
        },
        select: {
          id: true,
          createdAt: true,
          disqualified: true,
        },
      });
    });

    revalidatePath("/leaderboard");

    return createdResult;
  } catch (error) {
    if (error instanceof Error && error.message === "CONCURRENT_CONSUMED") {
      return saveDisqualifiedAudit("Game session consumed by a concurrent request.");
    }
    throw error;
  }
}

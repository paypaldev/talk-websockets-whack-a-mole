interface AntiCheatConfig {
  enabled: boolean;
  minGameDurationMs: number;
  sessionTtlMs: number;
  requireMobileDevice: boolean;
  maxScorePerGame: number;
  maxAttemptsPerGame: number;
  minInterAttemptMs: number;
  maxHitsPerSecondWindow: number;
  maxSessionsPerWindow: number;
  sessionRateLimitWindowMs: number;
  disqualifyZeroMisses: boolean;
}

const DEFAULT_ANTI_CHEAT_ENABLED = true;
const DEFAULT_MIN_GAME_DURATION_MS = 55_000;
const DEFAULT_SESSION_TTL_MS = 120_000;
const DEFAULT_REQUIRE_MOBILE_DEVICE = true;
// 2× the theoretical max score for a perfect script hitting every mole (126 pts)
const DEFAULT_MAX_SCORE_PER_GAME = 300;
const DEFAULT_MAX_ATTEMPTS_PER_GAME = 2_000;
// Below the fastest documented human reaction time (~100ms); 50ms allows for
// touch event timing variance on mobile while still blocking bot-speed inputs.
const DEFAULT_MIN_INTER_ATTEMPT_MS = 50;
// More than 6 hits per second exceeds what any human can sustain.
const DEFAULT_MAX_HITS_PER_SECOND_WINDOW = 6;
const DEFAULT_MAX_SESSIONS_PER_WINDOW = 5;
const DEFAULT_SESSION_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1_000; // 5 minutes
const DEFAULT_DISQUALIFY_ZERO_MISSES = false;

function parseBooleanEnv(
  rawValue: string | undefined,
  defaultValue: boolean,
): boolean {
  if (!rawValue) {
    return defaultValue;
  }

  const value = rawValue.trim().toLowerCase();
  if (value === "true" || value === "1" || value === "yes") {
    return true;
  }

  if (value === "false" || value === "0" || value === "no") {
    return false;
  }

  return defaultValue;
}

function parsePositiveIntegerEnv(
  rawValue: string | undefined,
  defaultValue: number,
): number {
  if (!rawValue) {
    return defaultValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return defaultValue;
  }

  return parsedValue;
}

export function getAntiCheatConfig(): AntiCheatConfig {
  return {
    enabled: parseBooleanEnv(
      process.env.ANTI_CHEAT_ENABLED,
      DEFAULT_ANTI_CHEAT_ENABLED,
    ),
    minGameDurationMs: parsePositiveIntegerEnv(
      process.env.ANTI_CHEAT_MIN_GAME_DURATION_MS,
      DEFAULT_MIN_GAME_DURATION_MS,
    ),
    sessionTtlMs: parsePositiveIntegerEnv(
      process.env.ANTI_CHEAT_SESSION_TTL_MS,
      DEFAULT_SESSION_TTL_MS,
    ),
    requireMobileDevice: parseBooleanEnv(
      process.env.ANTI_CHEAT_REQUIRE_MOBILE_DEVICE,
      DEFAULT_REQUIRE_MOBILE_DEVICE,
    ),
    maxScorePerGame: parsePositiveIntegerEnv(
      process.env.ANTI_CHEAT_MAX_SCORE_PER_GAME,
      DEFAULT_MAX_SCORE_PER_GAME,
    ),
    maxAttemptsPerGame: parsePositiveIntegerEnv(
      process.env.ANTI_CHEAT_MAX_ATTEMPTS_PER_GAME,
      DEFAULT_MAX_ATTEMPTS_PER_GAME,
    ),
    minInterAttemptMs: parsePositiveIntegerEnv(
      process.env.ANTI_CHEAT_MIN_INTER_ATTEMPT_MS,
      DEFAULT_MIN_INTER_ATTEMPT_MS,
    ),
    maxHitsPerSecondWindow: parsePositiveIntegerEnv(
      process.env.ANTI_CHEAT_MAX_HITS_PER_SECOND_WINDOW,
      DEFAULT_MAX_HITS_PER_SECOND_WINDOW,
    ),
    maxSessionsPerWindow: parsePositiveIntegerEnv(
      process.env.ANTI_CHEAT_MAX_SESSIONS_PER_WINDOW,
      DEFAULT_MAX_SESSIONS_PER_WINDOW,
    ),
    sessionRateLimitWindowMs: parsePositiveIntegerEnv(
      process.env.ANTI_CHEAT_SESSION_RATE_LIMIT_WINDOW_MS,
      DEFAULT_SESSION_RATE_LIMIT_WINDOW_MS,
    ),
    disqualifyZeroMisses: parseBooleanEnv(
      process.env.ANTI_CHEAT_DISQUALIFY_ZERO_MISSES,
      DEFAULT_DISQUALIFY_ZERO_MISSES,
    ),
  };
}

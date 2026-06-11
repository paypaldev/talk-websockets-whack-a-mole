interface AntiCheatConfig {
  enabled: boolean;
  minGameDurationMs: number;
  sessionTtlMs: number;
  requireMobileDevice: boolean;
}

const DEFAULT_ANTI_CHEAT_ENABLED = true;
const DEFAULT_MIN_GAME_DURATION_MS = 55_000;
const DEFAULT_SESSION_TTL_MS = 120_000;
const DEFAULT_REQUIRE_MOBILE_DEVICE = true;

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
  };
}

export const MAX_PLAYER_NAME_LENGTH = 80

/** Returns the trimmed player name without any validation. */
export function normalizePlayerName(rawName: string): string {
  return rawName.trim()
}

/**
 * Validates and normalises a raw player name string.
 * Throws an Error with a user-facing message on invalid input.
 * Returns the trimmed name on success.
 */
export function validatePlayerName(rawName: string): string {
  const playerName = normalizePlayerName(rawName)

  if (playerName.length === 0) {
    throw new Error('Player name is required.')
  }

  if (playerName.length > MAX_PLAYER_NAME_LENGTH) {
    throw new Error(`Player name must be ${MAX_PLAYER_NAME_LENGTH} characters or fewer.`)
  }

  return playerName
}

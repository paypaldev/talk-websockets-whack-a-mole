'use server'

import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { validatePlayerName } from '@/lib/playerName'
import { getAntiCheatConfig } from '@/lib/antiCheatConfig'

interface StartGameSessionResult {
  sessionId: string
  sessionToken: string
}

function hashSessionToken(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex')
}

function createSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function startGameSessionAction(rawPlayerName: string): Promise<StartGameSessionResult> {
  const playerName = validatePlayerName(rawPlayerName)
  const antiCheatConfig = getAntiCheatConfig()

  if (!antiCheatConfig.enabled) {
    return {
      sessionId: 'anti-cheat-disabled',
      sessionToken: 'anti-cheat-disabled',
    }
  }

  const sessionToken = createSessionToken()
  const expiresAt = new Date(Date.now() + antiCheatConfig.sessionTtlMs)

  const createdSession = await prisma.gameSession.create({
    data: {
      playerName,
      sessionTokenHash: hashSessionToken(sessionToken),
      expiresAt,
    },
    select: {
      id: true,
    },
  })

  return {
    sessionId: createdSession.id,
    sessionToken,
  }
}

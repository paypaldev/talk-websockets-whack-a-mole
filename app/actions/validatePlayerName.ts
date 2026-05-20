'use server'

import { prisma } from '@/lib/prisma'
import { validatePlayerName } from '@/lib/playerName'

interface ValidatePlayerNameResult {
  isUnique: boolean
  errorMessage: string | null
}

export async function validatePlayerNameAction(rawName: string): Promise<ValidatePlayerNameResult> {
  const playerName = validatePlayerName(rawName)

  const existingPlayer = await prisma.gameResult.findFirst({
    where: {
      playerName: {
        equals: playerName,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
    },
  })

  if (existingPlayer) {
    return {
      isUnique: false,
      errorMessage: 'That name is already taken. Please try another name.',
    }
  }

  return {
    isUnique: true,
    errorMessage: null,
  }
}
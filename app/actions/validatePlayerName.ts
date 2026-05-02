'use server'

import { prisma } from '@/lib/prisma'

interface ValidatePlayerNameResult {
  isUnique: boolean
  errorMessage: string | null
}

function validatePlayerNameInput(rawName: string): string {
  const playerName = rawName.trim()

  if (playerName.length === 0) {
    throw new Error('Player name is required.')
  }

  if (playerName.length > 80) {
    throw new Error('Player name must be 80 characters or fewer.')
  }

  return playerName
}

export async function validatePlayerNameAction(rawName: string): Promise<ValidatePlayerNameResult> {
  const playerName = validatePlayerNameInput(rawName)

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
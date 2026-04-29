'use server'

import { prisma } from '@/lib/prisma'

interface SaveGameResultInput {
  playerName: string
  score: number
  misses: number
}

function validateInput(input: SaveGameResultInput): SaveGameResultInput {
  const playerName = input.playerName.trim()

  if (playerName.length === 0) {
    throw new Error('playerName is required.')
  }

  if (playerName.length > 80) {
    throw new Error('playerName must be 80 characters or fewer.')
  }

  if (!Number.isInteger(input.score) || input.score < 0) {
    throw new Error('score must be a non-negative integer.')
  }

  if (!Number.isInteger(input.misses) || input.misses < 0) {
    throw new Error('misses must be a non-negative integer.')
  }

  return {
    playerName,
    score: input.score,
    misses: input.misses,
  }
}

export async function saveGameResultAction(input: SaveGameResultInput) {
  const validated = validateInput(input)

  return prisma.gameResult.create({
    data: {
      playerName: validated.playerName,
      score: validated.score,
      misses: validated.misses,
    },
    select: {
      id: true,
      createdAt: true,
    },
  })
}

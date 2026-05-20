'use client'

import { type ReactNode, useEffect, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { useStoredPlayerName } from './useStoredPlayerName'
import { normalizePlayerName } from '@/lib/playerName'

interface RequirePlayerNameProps {
  children: (playerName: string) => ReactNode
  fallback: ReactNode
  redirectTo?: string
}

export function RequirePlayerName({
  children,
  fallback,
  redirectTo = '/',
}: RequirePlayerNameProps) {
  const router = useRouter()
  const isHydrated = useSyncExternalStore(() => () => {}, () => true, () => false)
  const storedPlayerName = useStoredPlayerName()
  const playerName = normalizePlayerName(storedPlayerName)
  const hasPlayerName = playerName.length > 0

  useEffect(() => {
    if (isHydrated && !hasPlayerName) {
      router.replace(redirectTo)
    }
  }, [hasPlayerName, isHydrated, redirectTo, router])

  if (!isHydrated || !hasPlayerName) {
    return <>{fallback}</>
  }

  return <>{children(playerName)}</>
}

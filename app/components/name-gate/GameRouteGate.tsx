'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WhackAMole } from '../whack-a-mole/WhackAMole'
import { useStoredPlayerName } from './useStoredPlayerName'

export function GameRouteGate() {
  const router = useRouter()
  const storedPlayerName = useStoredPlayerName()
  const hasPlayerName = Boolean(storedPlayerName)

  useEffect(() => {
    if (!hasPlayerName) {
      router.replace('/')
    }
  }, [hasPlayerName, router])

  if (!hasPlayerName) {
    return (
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />
      </main>
    )
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />
      <WhackAMole playerName={storedPlayerName} />
    </main>
  )
}

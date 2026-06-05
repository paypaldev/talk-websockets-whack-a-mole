import { useState, useEffect, useCallback, useRef } from 'react'

export const GAME_DURATION = 60
export const NUM_HOLES = 9
const PAYPAL_MOLE_MAX = 3 // exactly 3 PayPal logos per game

interface DifficultyPhaseConfig {
  startSec: number
  endSec: number | null
  startVisibleMs: number
  endVisibleMs: number
  startGapMs: number
  endGapMs: number
  curvePower: number
}

// Difficulty tuning lives here so phase boundaries and timings are easy to change.
export const DIFFICULTY_PHASES: readonly DifficultyPhaseConfig[] = [
  {
    startSec: 0,
    endSec: 15,
    startVisibleMs: 1200,
    endVisibleMs: 900,
    startGapMs: 700,
    endGapMs: 500,
    curvePower: 1,
  },
  {
    startSec: 15,
    endSec: 30,
    startVisibleMs: 900,
    endVisibleMs: 560,
    startGapMs: 500,
    endGapMs: 280,
    curvePower: 0.85,
  },
  {
    startSec: 30,
    endSec: null,
    startVisibleMs: 560,
    endVisibleMs: 120,
    startGapMs: 280,
    endGapMs: 45,
    curvePower: 0.8,
  },
]

export type GameState = 'idle' | 'playing' | 'ended'
export type MoleType = 'mole' | 'paypal'

export interface GameEngineReturn {
  gameState: GameState
  score: number
  misses: number
  timeRemaining: number
  activeMoles: Map<number, MoleType>
  startGame: () => void
  whackMole: (index: number) => void
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t))
}

interface SpawnTiming {
  visibleMs: number
  gapMs: number
}

export function getDifficultyPhaseIndex(elapsedSecs: number): number {
  const clampedElapsedSecs = Math.min(Math.max(0, elapsedSecs), GAME_DURATION)

  const phaseIndex = DIFFICULTY_PHASES.findIndex(
    currentPhase =>
      clampedElapsedSecs >= currentPhase.startSec &&
      (currentPhase.endSec === null || clampedElapsedSecs < currentPhase.endSec)
  )

  return phaseIndex === -1 ? DIFFICULTY_PHASES.length - 1 : phaseIndex
}

function getSpawnTiming(elapsedSecs: number): SpawnTiming {
  const phase = DIFFICULTY_PHASES[getDifficultyPhaseIndex(elapsedSecs)]

  const phaseDurationSecs =
    phase.endSec === null ? Math.max(1, GAME_DURATION - phase.startSec) : phase.endSec - phase.startSec
  const phaseProgress = Math.min(1, Math.max(0, (elapsedSecs - phase.startSec) / phaseDurationSecs))
  const easedProgress = Math.pow(phaseProgress, phase.curvePower)

  return {
    visibleMs: lerp(phase.startVisibleMs, phase.endVisibleMs, easedProgress),
    gapMs: lerp(phase.startGapMs, phase.endGapMs, easedProgress),
  }
}

export function useGameEngine(): GameEngineReturn {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION)
  const [activeMoles, setActiveMoles] = useState<Map<number, MoleType>>(new Map())

  // Refs to avoid stale closure issues in async timeouts
  const activeMolesRef = useRef<Map<number, MoleType>>(new Map())
  const startTimeRef = useRef<number>(0)
  const paypalSpawnedRef = useRef<number>(0)

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setGameState('ended')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState])

  // Mole spawner — speed is determined by actual elapsed wall-clock time
  useEffect(() => {
    if (gameState !== 'playing') return

    startTimeRef.current = Date.now()
    const timeoutIds: ReturnType<typeof setTimeout>[] = []
    let cancelled = false

    const spawnMole = () => {
      if (cancelled) return

      const elapsedSecs = (Date.now() - startTimeRef.current) / 1000
      const { visibleMs, gapMs } = getSpawnTiming(elapsedSecs)

      const available = Array.from({ length: NUM_HOLES }, (_, i) => i).filter(
        i => !activeMolesRef.current.has(i)
      )

      if (available.length === 0) {
        const retryId = setTimeout(spawnMole, 200)
        timeoutIds.push(retryId)
        return
      }

      const holeIndex = available[Math.floor(Math.random() * available.length)]

      // Decide mole type: PayPal only appears in the last 10 seconds
      let moleType: MoleType = 'mole'
      if (paypalSpawnedRef.current < PAYPAL_MOLE_MAX && elapsedSecs >= GAME_DURATION - 10) {
        const remaining = PAYPAL_MOLE_MAX - paypalSpawnedRef.current
        // Spread across the remaining 10s window
        const windowFrac = Math.min(1, (elapsedSecs - (GAME_DURATION - 10)) / 10)
        const spawnChance = remaining / (NUM_HOLES * (1 - windowFrac + 0.1))
        if (Math.random() < spawnChance) {
          moleType = 'paypal'
          paypalSpawnedRef.current += 1
        }
      }

      setActiveMoles(prev => {
        const next = new Map(prev)
        next.set(holeIndex, moleType)
        activeMolesRef.current = next
        return next
      })

      const hideId = setTimeout(() => {
        if (cancelled) return

        // Update React state to trigger visual removal. Do NOT clear the ref
        // here — the DOM update is async, so if we clear the ref now, clicks
        // that arrive before the next paint register as misses even though the
        // mole is still visible.
        setActiveMoles(prev => {
          const next = new Map(prev)
          next.delete(holeIndex)
          return next
        })

        // Clear the ref slightly after the visual removal so it stays in sync
        // with the DOM. 80ms is well within one render frame on any device.
        const clearRefId = setTimeout(() => {
          if (cancelled) return
          const next = new Map(activeMolesRef.current)
          next.delete(holeIndex)
          activeMolesRef.current = next
        }, 80)
        timeoutIds.push(clearRefId)

        const gapId = setTimeout(spawnMole, gapMs)
        timeoutIds.push(gapId)
      }, visibleMs)

      timeoutIds.push(hideId)
    }

    const initialId = setTimeout(spawnMole, 400)
    timeoutIds.push(initialId)

    return () => {
      cancelled = true
      timeoutIds.forEach(clearTimeout)
      setActiveMoles(new Map())
      activeMolesRef.current = new Map()
    }
  }, [gameState])

  const startGame = useCallback(() => {
    setScore(0)
    setMisses(0)
    setTimeRemaining(GAME_DURATION)
    setActiveMoles(new Map())
    activeMolesRef.current = new Map()
    paypalSpawnedRef.current = 0
    setGameState('playing')
  }, [])

  const whackMole = useCallback((index: number) => {
    const type = activeMolesRef.current.get(index)
    if (type === undefined) {
      setMisses(prev => prev + 1)
      return
    }
    setActiveMoles(prev => {
      const next = new Map(prev)
      next.delete(index)
      activeMolesRef.current = next
      return next
    })
    setScore(prev => prev + (type === 'paypal' ? 10 : 1))
  }, [])

  return { gameState, score, misses, timeRemaining, activeMoles, startGame, whackMole }
}

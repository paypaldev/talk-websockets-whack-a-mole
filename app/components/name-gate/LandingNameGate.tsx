'use client'

import { SyntheticEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { validatePlayerNameAction } from '@/app/actions/validatePlayerName'
import { notifyStoredPlayerNameChanged, useStoredPlayerName } from './useStoredPlayerName'

export function LandingNameGate() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const storedPlayerName = useStoredPlayerName()
  const hasStoredName = Boolean(storedPlayerName)

  useEffect(() => {
    if (hasStoredName) {
      router.replace('/game')
    }
  }, [hasStoredName, router])

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const validationResult = await validatePlayerNameAction(trimmedName)

      if (!validationResult.isUnique) {
        setErrorMessage(validationResult.errorMessage ?? 'That name is unavailable. Try another one.')
        return
      }

      window.localStorage.setItem('whack-a-mole-player-name', trimmedName)
      notifyStoredPlayerNameChanged()
      router.push('/game')
    } catch {
      setErrorMessage('Unable to verify that name right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasStoredName) {
    return (
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />
      </main>
    )
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />

      <section className="relative z-10 mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/75 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:p-7">
        <Image
          src="/mole.png"
          alt="Whack-a-Mole"
          width={103}
          height={64}
          className="mb-4"
          style={{ animation: 'mole-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
          priority
        />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Enter your name</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          This name will be displayed publicly on the leaderboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label htmlFor="player-name" className="text-xs uppercase tracking-[0.18em] text-zinc-400">
            Player Name
          </label>
          <input
            id="player-name"
            name="player-name"
            type="text"
            value={name}
            onChange={event => {
              setName(event.target.value)
              if (errorMessage) {
                setErrorMessage(null)
              }
            }}
            className="w-full rounded-lg border border-white/15 bg-white/3 px-3.5 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-sky-300/70"
            placeholder="e.g. Alex"
            maxLength={40}
            autoFocus
            required
          />

          {errorMessage ? (
            <p className="text-sm text-rose-300" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/3 px-5 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/9 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Checking name...' : 'Continue to Game'}
          </button>
        </form>
      </section>
    </main>
  )
}

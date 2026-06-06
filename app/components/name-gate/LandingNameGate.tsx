"use client";

import { SyntheticEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { validatePlayerNameAction } from "@/app/actions/validatePlayerName";
import { MAX_PLAYER_NAME_LENGTH } from "@/lib/playerName";
import {
  notifyStoredPlayerNameChanged,
  PLAYER_NAME_KEY,
} from "./useStoredPlayerName";
import { RequireNoPlayerName } from "./RequireNoPlayerName";

export function LandingNameGate() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isBadgeNameConfirmed, setIsBadgeNameConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName || !trimmedLastName || !isBadgeNameConfirmed) {
      return;
    }

    const fullName = `${trimmedFirstName} ${trimmedLastName}`;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const validationResult = await validatePlayerNameAction(fullName);

      if (!validationResult.isUnique) {
        setErrorMessage(
          validationResult.errorMessage ??
            "That name is unavailable. Try another one.",
        );
        return;
      }

      window.localStorage.setItem(PLAYER_NAME_KEY, fullName);
      notifyStoredPlayerNameChanged();
      router.push("/game");
    } catch {
      setErrorMessage(
        "Unable to verify that name right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireNoPlayerName
      fallback={
        <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />
        </main>
      }
    >
      <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.06),transparent_30%)]" />
        <section className="relative z-10 mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/75 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:p-7">
          <Image
            src="/mole.png"
            alt="Whack-a-Mole"
            width={103}
            height={64}
            className="mb-4"
            style={{
              animation:
                "mole-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
            priority
          />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Enter your name
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            This name will be displayed publicly on the leaderboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label
              htmlFor="player-first-name"
              className="text-xs uppercase tracking-[0.18em] text-zinc-400"
            >
              First Name
            </label>
            <input
              id="player-first-name"
              name="player-first-name"
              type="text"
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                if (errorMessage) {
                  setErrorMessage(null);
                }
              }}
              className="w-full rounded-lg border border-white/15 bg-white/3 px-3.5 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-sky-300/70"
              placeholder="e.g. Alex"
              maxLength={MAX_PLAYER_NAME_LENGTH}
              autoFocus
              required
            />

            <label
              htmlFor="player-last-name"
              className="text-xs uppercase tracking-[0.18em] text-zinc-400"
            >
              Last Name
            </label>
            <input
              id="player-last-name"
              name="player-last-name"
              type="text"
              value={lastName}
              onChange={(event) => {
                setLastName(event.target.value);
                if (errorMessage) {
                  setErrorMessage(null);
                }
              }}
              className="w-full rounded-lg border border-white/15 bg-white/3 px-3.5 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-sky-300/70"
              placeholder="e.g. Doe"
              maxLength={MAX_PLAYER_NAME_LENGTH}
              required
            />

            <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/3 px-3.5 py-3 text-sm text-zinc-200">
              <input
                id="badge-name-confirmed"
                name="badge-name-confirmed"
                type="checkbox"
                checked={isBadgeNameConfirmed}
                onChange={(event) => {
                  setIsBadgeNameConfirmed(event.target.checked);
                }}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-zinc-900/60 text-sky-300 focus:ring-sky-300/60"
                required
              />
              <span>I understand this is the name on my badge</span>
            </label>

            {errorMessage ? (
              <p
                className="text-sm text-rose-300"
                role="alert"
                aria-live="polite"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/3 px-5 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/9 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                !firstName.trim() ||
                !lastName.trim() ||
                !isBadgeNameConfirmed ||
                isSubmitting
              }
            >
              {isSubmitting ? "Checking name..." : "Continue to Game"}
            </button>
          </form>
        </section>
      </main>
    </RequireNoPlayerName>
  );
}

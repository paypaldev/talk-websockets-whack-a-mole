"use client";

import { useSyncExternalStore } from "react";

export const PLAYER_NAME_KEY = "whack-a-mole-player-name";
const PLAYER_NAME_EVENT = "whack-a-mole-player-name-changed";

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(PLAYER_NAME_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PLAYER_NAME_EVENT, handleChange);
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(PLAYER_NAME_KEY)?.trim() ?? "";
}

function getServerSnapshot(): string {
  return "";
}

export function useStoredPlayerName(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function notifyStoredPlayerNameChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PLAYER_NAME_EVENT));
  }
}

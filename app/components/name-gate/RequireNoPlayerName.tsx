"use client";

import { type ReactNode, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useStoredPlayerName } from "./useStoredPlayerName";

interface RequireNoPlayerNameProps {
  children: ReactNode;
  fallback: ReactNode;
  redirectTo?: string;
}

export function RequireNoPlayerName({
  children,
  fallback,
  redirectTo = "/game",
}: RequireNoPlayerNameProps) {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const storedPlayerName = useStoredPlayerName();
  const hasPlayerName = storedPlayerName.trim().length > 0;

  useEffect(() => {
    if (isHydrated && hasPlayerName) {
      router.replace(redirectTo);
    }
  }, [hasPlayerName, isHydrated, redirectTo, router]);

  if (!isHydrated || hasPlayerName) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

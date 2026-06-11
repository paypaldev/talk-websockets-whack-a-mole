"use server";

import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validatePlayerName } from "@/lib/playerName";
import { getAntiCheatConfig } from "@/lib/antiCheatConfig";

interface StartGameSessionResult {
  sessionId: string;
  sessionToken: string;
}

function hashSessionToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

function isMobileUserAgent(ua: string | null): boolean {
  if (!ua) return false;
  return /Android|iPhone|iPad|iPod|Mobile|BlackBerry|Windows Phone/i.test(ua);
}

export async function startGameSessionAction(
  rawPlayerName: string,
): Promise<StartGameSessionResult> {
  const playerName = validatePlayerName(rawPlayerName);
  const antiCheatConfig = getAntiCheatConfig();

  if (!antiCheatConfig.enabled) {
    return {
      sessionId: "anti-cheat-disabled",
      sessionToken: "anti-cheat-disabled",
    };
  }

  if (antiCheatConfig.requireMobileDevice) {
    const requestHeaders = await headers();
    const ua = requestHeaders.get("user-agent");
    if (!isMobileUserAgent(ua)) {
      throw new Error("This game is only available on mobile devices.");
    }
  }

  const sessionToken = createSessionToken();
  const expiresAt = new Date(Date.now() + antiCheatConfig.sessionTtlMs);

  const createdSession = await prisma.gameSession.create({
    data: {
      playerName,
      sessionTokenHash: hashSessionToken(sessionToken),
      expiresAt,
    },
    select: {
      id: true,
    },
  });

  return {
    sessionId: createdSession.id,
    sessionToken,
  };
}

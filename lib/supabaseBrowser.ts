import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null | undefined

export const ACTIVE_GAMES_CHANNEL = 'leaderboard:games:active'
export const GAME_RESULTS_CHANNEL = 'leaderboard:games:results'
export const GAME_RESULTS_LEADERBOARD_CHANNEL = 'leaderboard:games:results:leaderboard'
export const LEADERBOARD_SWAG_CHANNEL = 'leaderboard:swag'
export const SWAG_STORE_ENABLED_EVENT = 'leaderboard:swag:store:enabled'
export const SWAG_STORE_CHECKOUT_ENABLED_EVENT = 'leaderboard:swag:store:checkout:enabled'
export const SWAG_STORE_CELEBRATION_EVENT = 'leaderboard:swag:store:celebration'

export interface SwagStoreBroadcastPayload {
  showSwagStore: boolean
}

export interface SwagCheckoutBroadcastPayload {
  enabled: boolean
}

export interface SwagCelebrationBroadcastPayload {
  launchedAt: number
}

export function isSwagStoreBroadcastPayload(value: unknown): value is SwagStoreBroadcastPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return typeof candidate.showSwagStore === 'boolean'
}

export function isSwagCheckoutBroadcastPayload(
  value: unknown,
): value is SwagCheckoutBroadcastPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return typeof candidate.enabled === 'boolean'
}

export function isSwagCelebrationBroadcastPayload(
  value: unknown,
): value is SwagCelebrationBroadcastPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return typeof candidate.launchedAt === 'number'
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    cachedClient = null
    return cachedClient
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}

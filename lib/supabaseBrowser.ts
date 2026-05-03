import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null | undefined

export const ACTIVE_GAMES_CHANNEL = 'leaderboard:games:active'
export const GAME_RESULTS_CHANNEL = 'leaderboard:games:results'
export const GAME_RESULTS_LEADERBOARD_CHANNEL = 'leaderboard:games:results:leaderboard'
export const LEADERBOARD_SWAG_CHANNEL = 'leaderboard:swag'
export const SWAG_STORE_ENABLED_EVENT = 'leaderboard:swag:store:enabled'

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

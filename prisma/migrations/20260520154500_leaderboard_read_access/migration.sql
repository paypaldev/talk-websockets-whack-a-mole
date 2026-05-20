-- Allow Supabase API roles to read leaderboard tables.
-- GRANT is idempotent and safe to run multiple times.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.game_results TO anon, authenticated;
GRANT SELECT ON TABLE public.swag_orders TO anon, authenticated;

-- If RLS is enabled, these policies allow public leaderboard reads.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'game_results'
      AND policyname = 'Public can read game results'
  ) THEN
    CREATE POLICY "Public can read game results"
      ON public.game_results
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'swag_orders'
      AND policyname = 'Public can read swag orders'
  ) THEN
    CREATE POLICY "Public can read swag orders"
      ON public.swag_orders
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Add game_results and swag_orders to realtime publication (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add game_results to publication if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'game_results'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE game_results;
    END IF;
END $$;

-- Add swag_orders to publication if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'swag_orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE swag_orders;
    END IF;
END $$;

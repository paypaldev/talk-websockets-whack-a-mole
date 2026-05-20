DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.game_results;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$$;

ALTER TABLE public.game_results REPLICA IDENTITY FULL;

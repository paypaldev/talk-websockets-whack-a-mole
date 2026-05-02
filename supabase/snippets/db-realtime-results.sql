alter publication supabase_realtime add table public.game_results;
alter table public.game_results replica identity full;
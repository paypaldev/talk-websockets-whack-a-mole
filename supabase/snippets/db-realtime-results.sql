alter publication supabase_realtime add table public.game_results;
alter table public.game_results replica identity full;
alter publication supabase_realtime add table public.swag_orders;
alter table public.swag_orders replica identity full;
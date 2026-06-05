-- Enable RLS so API access is policy-driven instead of unrestricted.
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swag_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Defense in depth: ensure game session rows are never exposed to public roles.
REVOKE ALL ON TABLE public.game_sessions FROM anon, authenticated;

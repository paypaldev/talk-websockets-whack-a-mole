DO $$
BEGIN
	ALTER PUBLICATION supabase_realtime ADD TABLE public.swag_orders;
EXCEPTION
	WHEN duplicate_object THEN
		NULL;
END
$$;

ALTER TABLE public.swag_orders REPLICA IDENTITY FULL;

-- Allow public roles to read only the name column from disqualified_names.
-- Ban reasons are intentionally withheld from the public API.
GRANT SELECT (id, name) ON TABLE public.disqualified_names TO anon, authenticated;

CREATE POLICY "Public can read disqualified names"
  ON public.disqualified_names
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add last_name to public.users (homeowners). Nullable: existing rows stay
-- with NULL last_name, and the dashboard renders just the first name when
-- last_name is absent.
ALTER TABLE public.users
  ADD COLUMN last_name TEXT;

COMMENT ON COLUMN public.users.last_name IS
  'Homeowner''s surname. Nullable for legacy rows created before this column existed.';

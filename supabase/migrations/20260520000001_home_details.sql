-- Home details table: stores physical attributes of a homeowner's property.
-- Populated by the SMS onboarding flow; each user has at most one row.
CREATE TABLE IF NOT EXISTS public.home_details (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  year_built                INTEGER,
  square_footage            INTEGER,
  roof_type                 TEXT,
  roof_age_years            INTEGER,
  construction_material     TEXT,
  hvac_brand                TEXT,
  hvac_age_years            INTEGER,
  hvac_last_service         DATE,
  water_heater_age_years    INTEGER,
  water_heater_last_flush   DATE,
  electrical_panel_age_years INTEGER,
  plumbing_type             TEXT,
  has_washer_dryer          BOOLEAN,
  washer_dryer_age_years    INTEGER,
  refrigerator_age_years    INTEGER,
  dishwasher_age_years      INTEGER,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.home_details IS
  'Physical attributes of a homeowner''s property, collected during SMS onboarding.';

CREATE INDEX home_details_user_id_idx ON public.home_details (user_id);

ALTER TABLE public.home_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "home_details: tenant members can select"
  ON public.home_details FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.users WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER home_details_updated_at
  BEFORE UPDATE ON public.home_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS sms_opt_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile_phone TEXT NOT NULL,
  email TEXT,
  home_address TEXT NOT NULL,
  warranty_provider TEXT NOT NULL,
  home_system_or_appliance TEXT,
  consent_timestamp TIMESTAMPTZ NOT NULL,
  consent_source_url TEXT NOT NULL,
  consent_language_version TEXT NOT NULL,
  terms_url TEXT NOT NULL,
  privacy_policy_url TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sms_opt_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sms_opt_ins: allow public insert"
  ON sms_opt_ins FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

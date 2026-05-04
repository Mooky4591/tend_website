-- Public SMS opt-in records. Written by the /api/sms-enrollment route handler
-- on behalf of unauthenticated visitors; never updated or deleted via API.
CREATE TABLE sms_enrollments (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name                TEXT        NOT NULL,
  phone                    TEXT        NOT NULL,
  email                    TEXT,
  home_address             TEXT        NOT NULL,
  warranty_provider        TEXT        NOT NULL,
  system_or_appliance      TEXT,
  sms_consent              BOOLEAN     NOT NULL,
  consent_language_version TEXT        NOT NULL,
  consent_source_url       TEXT        NOT NULL,
  terms_url                TEXT        NOT NULL,
  privacy_policy_url       TEXT        NOT NULL,
  ip_address               TEXT,
  user_agent               TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sms_enrollments ENABLE ROW LEVEL SECURITY;

-- Public visitors may insert (opt-in form). No API read/update/delete.
CREATE POLICY "sms_enrollments: public can insert"
  ON sms_enrollments FOR INSERT
  WITH CHECK (true);

-- Portal staff may read all enrollment records for reporting.
CREATE POLICY "sms_enrollments: tenant members can select"
  ON sms_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE INDEX sms_enrollments_phone_idx      ON sms_enrollments (phone);
CREATE INDEX sms_enrollments_created_at_idx ON sms_enrollments (created_at DESC);

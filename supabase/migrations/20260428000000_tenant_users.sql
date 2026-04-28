-- Create tenant_users join table (multiple staff per tenant, with roles)
CREATE TABLE tenant_users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id)    ON DELETE CASCADE,
  auth_user_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, auth_user_id)
);

-- RLS: tenant_users
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_users: members can read their own rows"
  ON tenant_users FOR SELECT
  USING (auth_user_id = auth.uid());

-- RLS: tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants: members can read their own tenant"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );

-- RLS: monthly_billing_snapshots
ALTER TABLE monthly_billing_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing: members can read their own tenant snapshots"
  ON monthly_billing_snapshots FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_users WHERE auth_user_id = auth.uid()
    )
  );

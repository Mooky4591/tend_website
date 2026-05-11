ALTER TABLE public.users
  ADD CONSTRAINT users_failure_reason_check
  CHECK (failure_reason IN (
    'invalid_number', 'landline', 'disconnected',
    'delivery_timeout', 'network_error',
    'carrier_blocked', 'account_error'
  ));

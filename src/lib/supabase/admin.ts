import { createClient } from '@supabase/supabase-js';

// Server-only: bypasses RLS for admin operations (payment confirmation, etc.)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

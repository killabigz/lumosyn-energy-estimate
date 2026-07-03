import "server-only";

import { createClient } from "@supabase/supabase-js";

function getRequiredServerEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required Supabase environment variable: ${name}`);
  }

  return value;
}

export function createSupabaseServiceClient() {
  return createClient(
    getRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

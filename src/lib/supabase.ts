import { createClient } from "@supabase/supabase-js";

import { env } from "../config/env";

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
  global: {
    headers: {
      "X-Client-Info": "walk-to-earn-backend",
    },
  },
};

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  clientOptions
);

export const supabasePublic = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLIC_KEY,
  clientOptions
);

export async function checkSupabaseApiConnection() {
  const { error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (error) {
    throw error;
  }
}

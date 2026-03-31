"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv } from "@/lib/supa-helpers";

export function createClient() {
  const { key, url } = getSupabasePublicEnv();

  return createBrowserClient<Database>(url, key);
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured =
  Boolean(url && anonKey) && !url!.includes('your-project-ref') && anonKey !== 'your-public-anon-key';

/**
 * `null` when env vars are missing -> the app transparently runs in Demo Mode.
 * The anon key is safe to ship to the browser: Row Level Security enforces access.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

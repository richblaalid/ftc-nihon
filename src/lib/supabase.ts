import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Only create client if credentials are available
let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
} else {
  // Only warn in development/build, not on every page render
  if (typeof window === 'undefined') {
    console.warn(
      'Supabase credentials not configured. App will work in offline-only mode. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.'
    );
  }
}

/**
 * Supabase client for syncing data
 *
 * Note: This is the SYNC layer, not the primary data source.
 * All reads should come from IndexedDB via Dexie.
 * Supabase is used for:
 * - Initial data download
 * - Real-time updates
 * - Admin writes (when authenticated)
 *
 * Returns null if Supabase is not configured - check with isSupabaseConfigured() first
 */
export const supabase = supabaseClient;

/**
 * Check if we're currently online and can reach Supabase
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    // Simple health check - fetch a single row from activities
    const { error } = await supabase.from('activities').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

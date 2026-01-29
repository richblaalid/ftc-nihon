import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get env vars at module load time - Next.js inlines NEXT_PUBLIC_* at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Create client at module load time if env vars are available
const supabaseClient: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return supabaseClient !== null;
}

/**
 * Get the Supabase client.
 * Returns null if Supabase is not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

/**
 * Supabase client for syncing data (lazy-loaded getter)
 *
 * Note: This is the SYNC layer, not the primary data source.
 * All reads should come from IndexedDB via Dexie.
 * Supabase is used for:
 * - Initial data download
 * - Real-time updates
 * - Admin writes (when authenticated)
 *
 * Returns null if Supabase is not configured - check with isSupabaseConfigured() first
 *
 * @deprecated Use getSupabaseClient() instead for explicit lazy loading
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return a no-op for common methods to prevent crashes
      if (prop === 'from' || prop === 'channel') {
        return () => ({
          select: () => ({ data: null, error: new Error('Supabase not configured') }),
          on: () => ({ subscribe: () => {} }),
          subscribe: () => {},
        });
      }
      return undefined;
    }
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Check if we're currently online and can reach Supabase
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // Simple health check - fetch a single row from activities
    const { error } = await client.from('activities').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

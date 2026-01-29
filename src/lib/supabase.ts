import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get env vars at module load time - Next.js inlines NEXT_PUBLIC_* at build time
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Log at module load to debug
console.log('[Supabase] Module loaded, env vars:', {
  hasUrl: !!SUPABASE_URL,
  hasKey: !!SUPABASE_ANON_KEY,
  urlPrefix: SUPABASE_URL?.substring(0, 30) || 'none',
});

// Create client at module load time if env vars are available
let supabaseClient: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  console.log('[Supabase] Creating client at module load...');
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
  console.log('[Supabase] Client created successfully');
} else {
  console.warn('[Supabase] Cannot create client at module load - missing env vars');
}

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
  if (!supabaseClient) {
    console.warn('[Supabase] getSupabaseClient called but client is null');
  }
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

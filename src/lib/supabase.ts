import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if Supabase is configured
 * First checks if client already exists (most reliable),
 * then falls back to checking env vars
 */
export function isSupabaseConfigured(): boolean {
  // If client already exists, we're definitely configured
  if (supabaseClient) {
    return true;
  }

  // Otherwise check env vars
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Lazy-initialized client - only created when first accessed
let supabaseClient: SupabaseClient | null = null;
let clientInitialized = false;

/**
 * Get the Supabase client, creating it lazily on first access.
 * This prevents errors during Next.js static generation when env vars aren't available.
 *
 * Returns null if Supabase is not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  // Return cached client if already initialized
  if (clientInitialized) {
    return supabaseClient;
  }

  clientInitialized = true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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

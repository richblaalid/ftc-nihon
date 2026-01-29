import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use globalThis to ensure singleton across all module instances
// This fixes issues with Next.js code splitting creating separate module states
const GLOBAL_KEY = '__ftc_supabase_client__' as const;

declare global {
  // eslint-disable-next-line no-var
  var __ftc_supabase_client__: SupabaseClient | undefined;
}

/**
 * Check if Supabase is configured
 * First checks if client already exists (most reliable),
 * then falls back to checking env vars
 */
export function isSupabaseConfigured(): boolean {
  // If client already exists, we're definitely configured
  if (globalThis[GLOBAL_KEY]) {
    return true;
  }

  // Otherwise check env vars
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Get the Supabase client, creating it lazily on first access.
 * Uses globalThis to ensure the client is shared across all code paths,
 * even with Next.js code splitting.
 *
 * Returns null if Supabase is not configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  // Return cached client if we have one (check global)
  const cachedClient = globalThis[GLOBAL_KEY];
  if (cachedClient) {
    console.log('[Supabase] Returning cached client from globalThis');
    return cachedClient;
  }

  // Try to create client if env vars are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('[Supabase] getSupabaseClient called:', {
    hasCachedClient: !!cachedClient,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 30),
  });

  if (supabaseUrl && supabaseAnonKey) {
    console.log('[Supabase] Creating client...');
    globalThis[GLOBAL_KEY] = createClient(supabaseUrl, supabaseAnonKey, {
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
    console.log('[Supabase] Client created and stored in globalThis');
    return globalThis[GLOBAL_KEY];
  }

  console.warn('[Supabase] Cannot create client - missing env vars');
  return null;
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

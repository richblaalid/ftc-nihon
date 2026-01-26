import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Activity,
  TransitSegment,
  Accommodation,
  Restaurant,
  Alert,
  LocationShare,
  AiCache,
  ChecklistItem,
} from '@/types/database';

/**
 * Converts Supabase snake_case row to camelCase for our TypeScript types
 */
function snakeToCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result as T;
}

/**
 * Converts an array of Supabase rows to camelCase
 */
function convertRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((row) => snakeToCamel<T>(row));
}

/**
 * Fetch all activities from Supabase
 */
export async function fetchActivities(): Promise<Activity[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('day_number')
    .order('sort_order');

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return convertRows<Activity>(data ?? []);
}

/**
 * Fetch all transit segments from Supabase
 */
export async function fetchTransitSegments(): Promise<TransitSegment[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase.from('transit_segments').select('*');

  if (error) {
    console.error('Error fetching transit segments:', error);
    throw error;
  }

  return convertRows<TransitSegment>(data ?? []);
}

/**
 * Fetch all accommodations from Supabase
 */
export async function fetchAccommodations(): Promise<Accommodation[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('accommodations')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Error fetching accommodations:', error);
    throw error;
  }

  return convertRows<Accommodation>(data ?? []);
}

/**
 * Fetch all restaurants from Supabase
 */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('day_number')
    .order('meal');

  if (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }

  return convertRows<Restaurant>(data ?? []);
}

/**
 * Fetch active alerts from Supabase
 */
export async function fetchAlerts(): Promise<Alert[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }

  return convertRows<Alert>(data ?? []);
}

/**
 * Fetch all alerts (including inactive) for admin
 */
export async function fetchAllAlerts(): Promise<Alert[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all alerts:', error);
    throw error;
  }

  return convertRows<Alert>(data ?? []);
}

/**
 * Fetch location shares from Supabase
 */
export async function fetchLocationShares(): Promise<LocationShare[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('location_shares')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching location shares:', error);
    throw error;
  }

  return convertRows<LocationShare>(data ?? []);
}

/**
 * Fetch AI cache entries from Supabase
 */
export async function fetchAiCache(): Promise<AiCache[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase.from('ai_cache').select('*');

  if (error) {
    console.error('Error fetching AI cache:', error);
    throw error;
  }

  return convertRows<AiCache>(data ?? []);
}

/**
 * Fetch checklist items from Supabase
 */
export async function fetchChecklistItems(): Promise<ChecklistItem[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .order('due_date')
    .order('sort_order');

  if (error) {
    console.error('Error fetching checklist items:', error);
    throw error;
  }

  return convertRows<ChecklistItem>(data ?? []);
}

/**
 * Fetch all data from all tables
 * Used for initial sync
 */
export async function fetchAllData(): Promise<{
  activities: Activity[];
  transitSegments: TransitSegment[];
  accommodations: Accommodation[];
  restaurants: Restaurant[];
  alerts: Alert[];
  locationShares: LocationShare[];
  aiCache: AiCache[];
  checklistItems: ChecklistItem[];
}> {
  const [
    activities,
    transitSegments,
    accommodations,
    restaurants,
    alerts,
    locationShares,
    aiCache,
    checklistItems,
  ] = await Promise.all([
    fetchActivities(),
    fetchTransitSegments(),
    fetchAccommodations(),
    fetchRestaurants(),
    fetchAlerts(),
    fetchLocationShares(),
    fetchAiCache(),
    fetchChecklistItems(),
  ]);

  return {
    activities,
    transitSegments,
    accommodations,
    restaurants,
    alerts,
    locationShares,
    aiCache,
    checklistItems,
  };
}

/**
 * Update a checklist item's completion status
 */
export async function updateChecklistItemStatus(
  id: string,
  isCompleted: boolean
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('checklist_items')
    .update({ is_completed: isCompleted })
    .eq('id', id);

  if (error) {
    console.error('Error updating checklist item:', error);
    throw error;
  }
}

/**
 * Update user location share
 */
export async function updateLocationShare(
  userName: string,
  lat: number,
  lng: number
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase.from('location_shares').upsert(
    {
      user_name: userName,
      lat,
      lng,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_name' }
  );

  if (error) {
    console.error('Error updating location share:', error);
    throw error;
  }
}

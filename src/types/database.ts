// TypeScript types matching Supabase schema
// See: Docs/product_docs/FTC_Nihon_Supabase_Schema.sql

export type ActivityCategory = 'food' | 'temple' | 'shopping' | 'transit' | 'activity' | 'hotel';
export type AlertType = 'info' | 'warning' | 'urgent';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Activity {
  id: string;
  dayNumber: number;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:MM format
  durationMinutes: number | null;
  name: string;
  category: ActivityCategory;
  locationName: string | null;
  locationAddress: string | null;
  locationAddressJp: string | null;
  locationLat: number | null;
  locationLng: number | null;
  googleMapsUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  tips: string | null;
  whatToOrder: string | null;
  backupAlternative: string | null;
  isHardDeadline: boolean;
  isKidFriendly: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransitStep {
  type: 'walk' | 'train' | 'transfer';
  instruction: string;
  duration: number; // minutes
  departure?: string; // HH:MM for train departures
}

export interface TransitSegment {
  id: string;
  activityId: string;
  leaveBy: string; // HH:MM format
  walkToStationMinutes: number | null;
  stationName: string | null;
  trainLine: string | null;
  suggestedDeparture: string | null; // HH:MM format
  travelMinutes: number | null;
  transfers: string | null;
  arrivalStation: string | null;
  walkToDestinationMinutes: number | null;
  bufferMinutes: number;
  steps: TransitStep[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Accommodation {
  id: string;
  name: string;
  address: string;
  addressJp: string | null;
  checkInTime: string | null; // HH:MM format
  checkOutTime: string | null; // HH:MM format
  confirmationNumber: string | null;
  pinCode: string | null;
  phone: string | null;
  googleMapsUrl: string | null;
  instructions: string | null;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  googleMapsUrl: string | null;
  websiteUrl: string | null;
  whatToOrder: string | null;
  backupAlternative: string | null;
  isKidFriendly: boolean;
  dayNumber: number | null;
  meal: MealType | null;
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  message: string;
  type: AlertType;
  active: boolean;
  expiresAt: string | null; // ISO datetime string
  createdBy: string | null;
  createdAt: string;
}

export interface LocationShare {
  id: string;
  userName: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface AiCache {
  id: string;
  questionPattern: string;
  contextType: string | null;
  contextKey: string | null;
  response: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null; // ISO date string YYYY-MM-DD
  dueTime: string | null; // HH:MM format
  isCompleted: boolean;
  isPreTrip: boolean;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

// Sync metadata for tracking last sync times
export interface SyncMeta {
  id: string;
  tableName: string;
  lastSyncedAt: string; // ISO datetime string
}

// Activity with transit info joined
export interface ActivityWithTransit extends Activity {
  transit?: TransitSegment | null;
}

// Trip constants
export const TRIP_START_DATE = '2026-03-06';
export const TRIP_END_DATE = '2026-03-21';
export const TRIP_DAYS = 15;

// City mapping for each day
export const DAY_CITIES: Record<number, string> = {
  1: 'Tokyo',
  2: 'Tokyo',
  3: 'Tokyo',
  4: 'Tokyo',
  5: 'Tokyo',
  6: 'Tokyo', // Day trip possible
  7: 'Hakone',
  8: 'Hakone',
  9: 'Kyoto',
  10: 'Kyoto',
  11: 'Kyoto',
  12: 'Osaka',
  13: 'Osaka',
  14: 'Osaka',
  15: 'Osaka', // Departure
};

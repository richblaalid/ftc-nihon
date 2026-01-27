// TypeScript types matching Supabase schema
// See: Docs/product_docs/FTC_Nihon_Supabase_Schema.sql

export type ActivityCategory = 'food' | 'temple' | 'shopping' | 'transit' | 'activity' | 'hotel';
export type AlertType = 'info' | 'warning' | 'urgent';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type FlightType = 'outbound' | 'return';
export type TicketStatus = 'purchased' | 'not_purchased';
export type DayType = 'travel' | 'self_guided' | 'guided_tour' | 'mixed';
export type AttractionCategory = 'temple' | 'shrine' | 'museum' | 'natural' | 'park' | 'entertainment' | 'market';
export type ShoppingCategory = 'shoes' | 'knives' | 'sports_merchandise' | 'eyewear' | 'general';

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
  locationLat: number | null;
  locationLng: number | null;
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

// ============================================================================
// ENRICHED DATA TYPES (from v2 JSON)
// ============================================================================

/**
 * Flight information for outbound and return journeys
 */
export interface Flight {
  id: string;
  type: FlightType;
  confirmation: string;
  flightNumber: string;
  aircraft: string | null;
  departureAirport: string;
  departureTerminal: string | null;
  departureDateTime: string; // ISO datetime
  departureLocalTime: string; // HH:MM format
  arrivalAirport: string;
  arrivalTerminal: string | null;
  arrivalDateTime: string; // ISO datetime
  arrivalLocalTime: string; // HH:MM format
  duration: string; // e.g., "13h 35m"
  seats: string | null; // JSON array of seat assignments
  createdAt: string;
  updatedAt: string;
}

/**
 * Ticket/reservation for attractions (TeamLab, Ghibli, Sumo, etc.)
 */
export interface Ticket {
  id: string;
  name: string;
  date: string; // ISO date YYYY-MM-DD
  status: TicketStatus;
  entryTime: string | null; // HH:MM format
  confirmations: string | null; // JSON array of confirmation codes
  purchaseSaleDate: string | null; // When tickets go on sale YYYY-MM-DD
  purchaseSaleTime: string | null; // JST time HH:MM
  purchaseLocalTime: string | null; // User's local time for purchase
  purchaseWebsite: string | null;
  purchaseNotes: string | null;
  locationName: string;
  locationAddress: string | null;
  locationLat: number | null;
  locationLng: number | null;
  duration: string | null; // e.g., "2-3 hours"
  tips: string | null; // JSON array of tips
  mapsUrl: string | null;
  specialNote: string | null; // e.g., "Emma's Birthday!"
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Trip information including guide contact and emergency numbers
 */
export interface TripInfo {
  id: string;
  guideName: string | null;
  guidePhone: string | null;
  guideEmail: string | null;
  emergencyPolice: string;
  emergencyFire: string;
  emergencyHelpline: string;
  emergencyEmbassy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hard deadline for a specific day
 */
export interface HardDeadline {
  time: string; // HH:MM format
  description: string;
}

/**
 * Meal plan for a day
 */
export interface MealPlan {
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
}

/**
 * Day metadata including title, type, highlights, and deadlines
 */
export interface DayInfo {
  id: string;
  dayNumber: number;
  date: string; // ISO date YYYY-MM-DD
  dayOfWeek: string;
  title: string;
  location: string;
  type: DayType;
  accommodationId: string | null;
  highlights: string | null; // JSON array of highlight strings
  hardDeadlines: string | null; // JSON array of HardDeadline objects
  meals: string | null; // JSON object MealPlan
  optimizationNote: string | null;
  transitSummary: string | null; // JSON with totalMinutes, segments
  createdAt: string;
  updatedAt: string;
}

/**
 * Detailed attraction information
 */
export interface Attraction {
  id: string;
  name: string;
  nameJapanese: string | null;
  city: string;
  district: string | null;
  category: AttractionCategory;
  description: string | null;
  highlights: string | null; // JSON array
  duration: number; // minutes
  cost: number; // JPY, 0 if free
  isKidFriendly: boolean;
  locationLat: number | null;
  locationLng: number | null;
  mapsUrl: string | null;
  tips: string | null; // JSON array
  nearestStation: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shopping location with details
 */
export interface ShoppingLocation {
  id: string;
  name: string;
  category: ShoppingCategory;
  city: string;
  district: string | null;
  address: string | null;
  hours: string | null;
  phone: string | null;
  website: string | null;
  locationLat: number | null;
  locationLng: number | null;
  mapsUrl: string | null;
  priceRange: string | null;
  features: string | null; // JSON array
  notes: string | null;
  nearestStation: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Japanese phrase with meaning and usage context
 */
export interface Phrase {
  id: string;
  japanese: string;
  romaji: string | null;
  meaning: string;
  when: string; // When to use this phrase
  category: string | null; // e.g., 'greeting', 'restaurant', 'transit'
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Key transportation route with duration and cost
 */
export interface TransportRoute {
  id: string;
  from: string;
  to: string;
  method: string; // e.g., "Shinkansen", "JR Line", "Bus"
  duration: number; // minutes
  cost: number; // JPY
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Activity with transit info joined (flattened for convenience)
export interface ActivityWithTransit extends Activity {
  transit?: TransitSegment | null;
  // Flattened transit fields for easy access
  leaveBy?: string | null;
  walkToStationMinutes?: number | null;
  stationName?: string | null;
  trainLine?: string | null;
  suggestedDeparture?: string | null;
  travelMinutes?: number | null;
  transfers?: string | null;
  arrivalStation?: string | null;
  walkToDestinationMinutes?: number | null;
  bufferMinutes?: number | null;
  transitSteps?: TransitStep[] | null;
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

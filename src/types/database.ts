// TypeScript types matching Supabase schema
// See: Docs/product_docs/FTC_Nihon_Supabase_Schema.sql

export type ActivityCategory = 'food' | 'temple' | 'shopping' | 'transit' | 'activity' | 'hotel';
export type AlertType = 'info' | 'warning' | 'urgent';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'afternoon';
export type MealPriority = 'primary' | 'alternative' | 'INCLUDED';
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

/**
 * Meal assignment linking a restaurant to a specific day and meal
 */
export interface MealAssignment {
  day: number;
  date: string; // ISO date YYYY-MM-DD
  meal: MealType;
  priority: MealPriority;
}

/**
 * Restaurant with full metadata from enriched JSON
 */
export interface Restaurant {
  id: string;
  name: string;
  nameJapanese: string | null;
  type: string | null; // Cuisine type (Ramen, Tempura, etc.)
  address: string | null;
  addressJapanese: string | null;
  locationLat: number | null;
  locationLng: number | null;
  nearestStation: string | null;
  phone: string | null;
  hours: string | null;
  priceRange: string | null;
  isKidFriendly: boolean;
  notes: string | null;
  googleMapsUrl: string | null;
  websiteUrl: string | null;
  whatToOrder: string | null;
  backupAlternative: string | null;
  city: string | null;
  // Meal assignments - JSON serialized array of MealAssignment
  assignedMeals: string | null;
  // Legacy fields for backward compatibility
  dayNumber: number | null;
  meal: MealType | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * User's meal selection for a specific day and meal
 * Stored in IndexedDB for offline-first operation
 */
export interface MealSelection {
  id: string; // Format: `${dayNumber}-${meal}` e.g., "2-dinner"
  dayNumber: number;
  meal: MealType;
  restaurantId: string;
  selectedAt: string; // ISO datetime
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

/**
 * Chat message stored in local database for AI chat history
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO date string
  createdAt: string;
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
export const TRIP_START_DATE = '2026-03-06'; // Departure from Minneapolis
export const TRIP_END_DATE = '2026-03-21';
export const TRIP_DAYS = 16; // Day 0 (departure) through Day 15

// City mapping for each day (based on accommodation - where you sleep that night)
export const DAY_CITIES: Record<number, string> = {
  0: 'Travel',  // Departure from Minneapolis (on plane)
  1: 'Tokyo',   // Arrive Tokyo, night at &Here Shinjuku
  2: 'Tokyo',   // Night at &Here Shinjuku
  3: 'Tokyo',   // Night at &Here Shinjuku
  4: 'Tokyo',   // Night at &Here Shinjuku
  5: 'Tokyo',   // Night at &Here Shinjuku (last Tokyo night)
  6: 'Hakone',  // Travel to Hakone, night at Yoshimatsu Ryokan
  7: 'Hakone',  // Night at Yoshimatsu Ryokan (last Hakone night)
  8: 'Kyoto',   // Travel to Kyoto, night at Fujinoma Machiya
  9: 'Kyoto',   // Night at Fujinoma Machiya
  10: 'Kyoto',  // Night at Fujinoma Machiya (last Kyoto night)
  11: 'Osaka',  // Travel to Osaka, night at MIMARU
  12: 'Osaka',  // Night at MIMARU
  13: 'Osaka',  // Night at MIMARU
  14: 'Osaka',  // Night at MIMARU (last night in Japan)
  15: 'Travel', // Departure from Japan
};

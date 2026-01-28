/**
 * @deprecated This file is no longer used.
 * The single source of truth is now src/db/seed-data.ts
 * This file remains for reference but is not imported anywhere.
 *
 * Original purpose: Transformed trip-itinerary.json into database-ready format
 */

import tripData from '@/data/trip-itinerary.json';
import type {
  Activity,
  Accommodation,
  TransitSegment,
  Flight,
  Ticket,
  TripInfo,
  DayInfo,
  Restaurant,
  Phrase,
  MealAssignment,
} from '@/types/database';

// Current timestamp for createdAt/updatedAt
const now = new Date().toISOString();

// Type for the JSON structure
interface TripItinerary {
  trip: {
    id: string;
    guide: { name: string; phone: string; email: string };
    emergency: { police: string; fireAmbulance: string; helpline: string; usEmbassy: string };
  };
  accommodations: Array<{
    id: string;
    name: string;
    address: string;
    addressJp?: string | null;
    checkInTime: string;
    checkOutTime: string;
    confirmationNumber: string;
    pinCode?: string | null;
    phone: string;
    googleMapsUrl?: string | null;
    instructions?: string | null;
    startDate: string;
    endDate: string;
    locationLat?: number | null;
    locationLng?: number | null;
  }>;
  flights: Array<{
    id: string;
    type: 'outbound' | 'return';
    confirmation: string;
    flightNumber: string;
    aircraft?: string | null;
    departureAirport: string;
    departureTerminal?: string | null;
    departureDateTime: string;
    departureLocalTime: string;
    arrivalAirport: string;
    arrivalTerminal?: string | null;
    arrivalDateTime: string;
    arrivalLocalTime: string;
    duration: string;
    seats?: string[] | null;
  }>;
  days: Array<{
    dayNumber: number;
    date: string;
    dayOfWeek: string;
    title: string;
    location: string;
    type: 'travel' | 'self_guided' | 'guided_tour' | 'mixed';
    accommodationId?: string | null;
    highlights: string[];
    hardDeadlines: Array<{ time: string; description: string }>;
    meals: { breakfast?: string | null; lunch?: string | null; dinner?: string | null };
  }>;
  activities: Array<{
    id: string;
    dayNumber: number;
    date: string;
    startTime: string;
    durationMinutes?: number | null;
    name: string;
    category: 'food' | 'temple' | 'shopping' | 'transit' | 'activity' | 'hotel';
    locationName?: string | null;
    locationAddress?: string | null;
    locationAddressJp?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    googleMapsUrl?: string | null;
    websiteUrl?: string | null;
    description?: string | null;
    tips?: string | null;
    whatToOrder?: string | null;
    backupAlternative?: string | null;
    isHardDeadline?: boolean;
    isKidFriendly?: boolean;
    sortOrder: number;
  }>;
  restaurants: Array<{
    id: string;
    name: string;
    nameJapanese?: string | null;
    type?: string | null;
    city?: string | null;
    district?: string | null;
    address?: string | null;
    addressJapanese?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    nearestStation?: string | null;
    phone?: string | null;
    hours?: string | null;
    priceRange?: string | null;
    isKidFriendly?: boolean;
    notes?: string | null;
    googleMapsUrl?: string | null;
    websiteUrl?: string | null;
    whatToOrder?: string | null;
    backupAlternative?: string | null;
    assignedMeals: MealAssignment[];
  }>;
  tickets: Array<{
    id: string;
    name: string;
    date: string;
    status: 'purchased' | 'not_purchased';
    entryTime?: string | null;
    confirmations?: string[] | null;
    purchaseSaleDate?: string | null;
    purchaseSaleTime?: string | null;
    purchaseWebsite?: string | null;
    purchaseNotes?: string | null;
    locationName: string;
    locationAddress?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    duration?: string | null;
    tips?: string[] | null;
    mapsUrl?: string | null;
  }>;
  transitSegments?: Array<{
    id: string;
    activityId: string;
    leaveBy: string;
    walkToStationMinutes?: number | null;
    stationName?: string | null;
    trainLine?: string | null;
    suggestedDeparture?: string | null;
    travelMinutes?: number | null;
    transfers?: string | null;
    arrivalStation?: string | null;
    walkToDestinationMinutes?: number | null;
    bufferMinutes?: number;
    notes?: string | null;
  }>;
  phrases?: Array<{
    id: string;
    japanese: string;
    romaji?: string | null;
    meaning: string;
    when: string;
    category?: string | null;
  }>;
}

// Cast the imported JSON to our type
const data = tripData as TripItinerary;

/**
 * Transform accommodations from JSON to database format
 */
export const accommodations: Accommodation[] = data.accommodations.map((acc, index) => ({
  id: acc.id,
  name: acc.name,
  address: acc.address,
  addressJp: acc.addressJp ?? null,
  checkInTime: acc.checkInTime,
  checkOutTime: acc.checkOutTime,
  confirmationNumber: acc.confirmationNumber,
  pinCode: acc.pinCode ?? null,
  phone: acc.phone,
  googleMapsUrl: acc.googleMapsUrl ?? null,
  instructions: acc.instructions ?? null,
  startDate: acc.startDate,
  endDate: acc.endDate,
  locationLat: acc.locationLat ?? null,
  locationLng: acc.locationLng ?? null,
  sortOrder: index + 1,
  createdAt: now,
  updatedAt: now,
}));

/**
 * Transform flights from JSON to database format
 */
export const flights: Flight[] = data.flights.map((flight) => ({
  id: flight.id,
  type: flight.type,
  confirmation: flight.confirmation,
  flightNumber: flight.flightNumber,
  aircraft: flight.aircraft ?? null,
  departureAirport: flight.departureAirport,
  departureTerminal: flight.departureTerminal ?? null,
  departureDateTime: flight.departureDateTime,
  departureLocalTime: flight.departureLocalTime,
  arrivalAirport: flight.arrivalAirport,
  arrivalTerminal: flight.arrivalTerminal ?? null,
  arrivalDateTime: flight.arrivalDateTime,
  arrivalLocalTime: flight.arrivalLocalTime,
  duration: flight.duration,
  seats: flight.seats ? JSON.stringify(flight.seats) : null,
  createdAt: now,
  updatedAt: now,
}));

/**
 * Transform days from JSON to DayInfo format
 */
export const dayInfo: DayInfo[] = data.days.map((day) => ({
  id: `day-${String(day.dayNumber).padStart(2, '0')}`,
  dayNumber: day.dayNumber,
  date: day.date,
  dayOfWeek: day.dayOfWeek,
  title: day.title,
  location: day.location,
  type: day.type,
  accommodationId: day.accommodationId ?? null,
  highlights: JSON.stringify(day.highlights),
  hardDeadlines: JSON.stringify(day.hardDeadlines),
  meals: JSON.stringify(day.meals),
  optimizationNote: null,
  transitSummary: null,
  createdAt: now,
  updatedAt: now,
}));

/**
 * Transform activities from JSON to database format
 */
export const activities: Activity[] = data.activities.map((act) => ({
  id: act.id,
  dayNumber: act.dayNumber,
  date: act.date,
  startTime: act.startTime,
  durationMinutes: act.durationMinutes ?? null,
  name: act.name,
  category: act.category,
  locationName: act.locationName ?? null,
  locationAddress: act.locationAddress ?? null,
  locationAddressJp: act.locationAddressJp ?? null,
  locationLat: act.locationLat ?? null,
  locationLng: act.locationLng ?? null,
  googleMapsUrl: act.googleMapsUrl ?? null,
  websiteUrl: act.websiteUrl ?? null,
  description: act.description ?? null,
  tips: act.tips ?? null,
  whatToOrder: act.whatToOrder ?? null,
  backupAlternative: act.backupAlternative ?? null,
  isHardDeadline: act.isHardDeadline ?? false,
  isKidFriendly: act.isKidFriendly ?? true,
  sortOrder: act.sortOrder,
  createdAt: now,
  updatedAt: now,
}));

/**
 * Transform restaurants from JSON to database format
 */
export const restaurants: Restaurant[] = data.restaurants.map((rest) => ({
  id: rest.id,
  name: rest.name,
  nameJapanese: rest.nameJapanese ?? null,
  type: rest.type ?? null,
  address: rest.address ?? null,
  addressJapanese: rest.addressJapanese ?? null,
  locationLat: rest.locationLat ?? null,
  locationLng: rest.locationLng ?? null,
  nearestStation: rest.nearestStation ?? null,
  phone: rest.phone ?? null,
  hours: rest.hours ?? null,
  priceRange: rest.priceRange ?? null,
  isKidFriendly: rest.isKidFriendly ?? true,
  notes: rest.notes ?? null,
  googleMapsUrl: rest.googleMapsUrl ?? null,
  websiteUrl: rest.websiteUrl ?? null,
  whatToOrder: rest.whatToOrder ?? null,
  backupAlternative: rest.backupAlternative ?? null,
  city: rest.city ?? null,
  assignedMeals: JSON.stringify(rest.assignedMeals),
  // Legacy fields
  dayNumber: null,
  meal: null,
  createdAt: now,
  updatedAt: now,
}));

/**
 * Transform tickets from JSON to database format
 */
export const tickets: Ticket[] = data.tickets.map((ticket, index) => ({
  id: ticket.id,
  name: ticket.name,
  date: ticket.date,
  status: ticket.status,
  entryTime: ticket.entryTime ?? null,
  confirmations: ticket.confirmations ? JSON.stringify(ticket.confirmations) : null,
  purchaseSaleDate: ticket.purchaseSaleDate ?? null,
  purchaseSaleTime: ticket.purchaseSaleTime ?? null,
  purchaseLocalTime: null,
  purchaseWebsite: ticket.purchaseWebsite ?? null,
  purchaseNotes: ticket.purchaseNotes ?? null,
  locationName: ticket.locationName,
  locationAddress: ticket.locationAddress ?? null,
  locationLat: ticket.locationLat ?? null,
  locationLng: ticket.locationLng ?? null,
  duration: ticket.duration ?? null,
  tips: ticket.tips ? JSON.stringify(ticket.tips) : null,
  mapsUrl: ticket.mapsUrl ?? null,
  specialNote: null,
  sortOrder: index + 1,
  createdAt: now,
  updatedAt: now,
}));

/**
 * Transform transit segments from JSON to database format
 */
export const transitSegments: TransitSegment[] = (data.transitSegments ?? []).map((transit) => ({
  id: transit.id,
  activityId: transit.activityId,
  leaveBy: transit.leaveBy,
  walkToStationMinutes: transit.walkToStationMinutes ?? null,
  stationName: transit.stationName ?? null,
  trainLine: transit.trainLine ?? null,
  suggestedDeparture: transit.suggestedDeparture ?? null,
  travelMinutes: transit.travelMinutes ?? null,
  transfers: transit.transfers ?? null,
  arrivalStation: transit.arrivalStation ?? null,
  walkToDestinationMinutes: transit.walkToDestinationMinutes ?? null,
  bufferMinutes: transit.bufferMinutes ?? 10,
  steps: null,
  createdAt: now,
  updatedAt: now,
}));

/**
 * Transform phrases from JSON to database format
 */
export const phrases: Phrase[] = (data.phrases ?? []).map((phrase, index) => ({
  id: phrase.id,
  japanese: phrase.japanese,
  romaji: phrase.romaji ?? null,
  meaning: phrase.meaning,
  when: phrase.when,
  category: phrase.category ?? null,
  sortOrder: index + 1,
  createdAt: now,
  updatedAt: now,
}));

/**
 * Create trip info from JSON
 */
export const tripInfo: TripInfo[] = [
  {
    id: 'trip-info-1',
    guideName: data.trip.guide.name,
    guidePhone: data.trip.guide.phone,
    guideEmail: data.trip.guide.email,
    emergencyPolice: data.trip.emergency.police,
    emergencyFire: data.trip.emergency.fireAmbulance,
    emergencyHelpline: data.trip.emergency.helpline,
    emergencyEmbassy: data.trip.emergency.usEmbassy,
    createdAt: now,
    updatedAt: now,
  },
];

// Empty arrays for types not in JSON (will be populated elsewhere or not needed)
export const attractions: never[] = [];
export const shoppingLocations: never[] = [];
export const transportRoutes: never[] = [];
export const checklistItems: never[] = [];

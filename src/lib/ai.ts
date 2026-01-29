import { TRIP_START_DATE, TRIP_END_DATE } from '@/types/database';
import { TRIP_CITIES } from '@/lib/trip-dates';
import type { Activity, Accommodation } from '@/types/database';

/**
 * Build system prompt with trip context for the AI assistant.
 */
export function buildSystemPrompt(context: TripContext): string {
  const { currentDay, currentActivity, nextActivity, todayActivities, currentCity, accommodation } = context;

  const today = new Date();
  const japanTime = today.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });

  return `You are a helpful travel assistant for the "Finer Things Club" Japan trip, taking place from ${TRIP_START_DATE} to ${TRIP_END_DATE}.

## Trip Overview
- Travelers: 4 adults and 3 children (including a 2-year-old)
- Cities: ${TRIP_CITIES.join(', ')}
- You should be friendly, concise, and family-oriented in your responses.

## Current Context
- Current time (Japan): ${japanTime}
- Trip day: ${currentDay !== null ? `Day ${currentDay}` : 'Before/after trip'}
- Current city: ${currentCity ?? 'Unknown'}
${currentActivity ? `- Current activity: ${currentActivity.name} at ${currentActivity.locationName}` : '- Current activity: None (free time)'}
${nextActivity ? `- Next activity: ${nextActivity.name} at ${nextActivity.startTime}` : ''}
${accommodation ? `- Tonight's hotel: ${accommodation.name}` : ''}

## Today's Schedule
${
  todayActivities && todayActivities.length > 0
    ? todayActivities.map((a) => `- ${a.startTime}: ${a.name} (${a.category})`).join('\n')
    : 'No activities scheduled for today.'
}

## Guidelines
1. Be helpful and concise - mobile screens are small!
2. Always consider the family has young children
3. When giving directions, mention landmarks and visual cues
4. For Japanese phrases, include: English → Romaji (pronunciation) → Japanese characters
5. If asked about schedule changes, remind them only Rich can edit the itinerary
6. For emergency situations, provide relevant local numbers (110 police, 119 fire/ambulance)
7. Be culturally sensitive and include relevant etiquette tips when appropriate

Please help the travelers have an amazing Japan experience!`;
}

/**
 * Context about the current trip state to inject into AI prompts.
 */
export interface TripContext {
  currentDay: number | null;
  currentActivity: Activity | null;
  nextActivity: Activity | null;
  todayActivities: Activity[] | null;
  currentCity: string | null;
  accommodation: Accommodation | null;
}

/**
 * Create an empty trip context for when data isn't available.
 */
export function createEmptyContext(): TripContext {
  return {
    currentDay: null,
    currentActivity: null,
    nextActivity: null,
    todayActivities: null,
    currentCity: null,
    accommodation: null,
  };
}

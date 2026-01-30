'use client';

import { db } from '@/db/database';
import {
  getTourContent,
  getCityOverview,
  getAllTourLocationIds,
  type TourContent,
} from '@/db/seed-tour-content';
import type { TourContentEntry } from '@/types/database';

/**
 * Tour guide service with hybrid online/offline content delivery.
 * Checks online status → if online, can generate fresh content via Claude → caches result.
 * If offline, serves pre-cached content.
 */

/**
 * Fetch tour content for a location, with online/offline hybrid support.
 * For now, returns pre-cached content since we have good coverage.
 * Future: Add AI generation for locations without pre-cached content.
 */
export async function fetchTourContent(
  locationId: string
): Promise<TourContent | null> {
  // First, try to get pre-cached content
  const cachedContent = getTourContent(locationId);
  if (cachedContent) {
    return cachedContent;
  }

  // Check if we have dynamically generated content in IndexedDB
  const dynamicContent = await getDynamicTourContent(locationId);
  if (dynamicContent) {
    return dynamicContent;
  }

  // If online and no cached content, we could generate via AI
  // For now, return null - AI generation can be added later
  if (navigator.onLine) {
    // Future: Generate content via Claude API
    // const generated = await generateTourContent(locationId);
    // if (generated) {
    //   await saveDynamicTourContent(locationId, generated);
    //   return generated;
    // }
  }

  return null;
}

/**
 * Fetch city overview content with hybrid support.
 */
export async function fetchCityOverview(city: string): Promise<TourContent | null> {
  // First, try pre-cached content
  const cachedContent = getCityOverview(city);
  if (cachedContent) {
    return cachedContent;
  }

  // Check dynamic content
  const locationId = `city-${city.toLowerCase()}`;
  const dynamicContent = await getDynamicTourContent(locationId);
  if (dynamicContent) {
    return dynamicContent;
  }

  return null;
}

/**
 * Convert database entry to TourContent format
 */
function toTourContent(entry: TourContentEntry): TourContent {
  return {
    id: `tour-${entry.locationId}`,
    locationId: entry.locationId,
    title: entry.title,
    titleJapanese: entry.titleJapanese,
    content: entry.content,
    type: entry.type,
    city: entry.city,
    highlights: entry.highlights,
    etiquetteTips: entry.etiquetteTips,
  };
}

/**
 * Get dynamically generated/cached tour content from IndexedDB.
 */
async function getDynamicTourContent(
  locationId: string
): Promise<TourContent | null> {
  try {
    const content = await db.tourContent.get(locationId);
    return content ? toTourContent(content) : null;
  } catch (error) {
    console.warn('[TourGuide] Error fetching dynamic content:', error);
    return null;
  }
}

/**
 * Save dynamically generated tour content to IndexedDB.
 */
export async function saveDynamicTourContent(
  locationId: string,
  content: TourContent
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const entry: TourContentEntry = {
      locationId,
      title: content.title,
      titleJapanese: content.titleJapanese,
      content: content.content,
      type: content.type,
      city: content.city,
      highlights: content.highlights,
      etiquetteTips: content.etiquetteTips,
      createdAt: now,
      updatedAt: now,
    };
    await db.tourContent.put(entry);
  } catch (error) {
    console.warn('[TourGuide] Error saving dynamic content:', error);
  }
}

/**
 * Check if tour content exists for a location.
 */
export function hasTourContent(locationId: string): boolean {
  return getTourContent(locationId) !== null;
}

/**
 * Check if city overview exists.
 */
export function hasCityOverview(city: string): boolean {
  return getCityOverview(city) !== null;
}

/**
 * Get all available tour content location IDs.
 */
export function getAvailableLocations(): string[] {
  return getAllTourLocationIds();
}

/**
 * Explicit mappings from activity names to tour content locationIds.
 * This handles cases where activity names don't exactly match locationIds.
 */
const ACTIVITY_TO_TOUR_MAPPING: Record<string, string> = {
  // Tokyo
  'asakusa - senso-ji temple': 'senso-ji',
  'senso-ji temple': 'senso-ji',
  'sensoji temple': 'senso-ji',
  'senso-ji': 'senso-ji',
  'harajuku - lunch, meiji shrine & shopping': 'meiji-shrine',
  'meiji shrine': 'meiji-shrine',
  'meiji jingu': 'meiji-shrine',
  'meiji jingu shrine': 'meiji-shrine',
  'teamlab borderless': 'teamlab-borderless',
  'tokyo skytree & solamachi': 'tokyo-tower', // Skytree content could be added, using tower for now
  'tokyo tower': 'tokyo-tower',

  // Hakone
  'hakone shrine': 'hakone-shrine',
  'owakudani (hell valley)': 'owakudani',
  'owakudani': 'owakudani',
  'hakone circuit to lake ashi': 'hakone-shrine', // Show shrine content for Hakone activities

  // Kyoto
  'kinkaku-ji (golden pavilion)': 'kinkaku-ji',
  'kinkaku-ji': 'kinkaku-ji',
  'golden pavilion': 'kinkaku-ji',
  'fushimi inari': 'fushimi-inari',
  'fushimi inari taisha': 'fushimi-inari',
  'bamboo grove & tenryu-ji temple': 'arashiyama-bamboo',
  'arashiyama bamboo grove': 'arashiyama-bamboo',
  'arashiyama': 'arashiyama-bamboo',
  'gion backstreets & nishiki market': 'gion',
  'gion': 'gion',

  // Osaka
  'dotonbori evening': 'dotonbori',
  'dotonbori': 'dotonbori',
  'osaka castle': 'osaka-castle',
};

/**
 * Map activity categories to locationId patterns for tour content.
 * Returns potential locationIds based on activity name and category.
 */
export function getLocationIdForActivity(
  activityName: string,
  category: string
): string | null {
  // Only provide tour content for cultural/experience categories
  if (!['temple', 'activity', 'food', 'shopping'].includes(category.toLowerCase())) {
    return null;
  }

  const normalizedName = activityName.toLowerCase().trim();

  // Check explicit mapping first
  if (ACTIVITY_TO_TOUR_MAPPING[normalizedName]) {
    const locationId = ACTIVITY_TO_TOUR_MAPPING[normalizedName];
    if (hasTourContent(locationId)) {
      return locationId;
    }
  }

  // Try normalized name directly
  const sluggedName = normalizedName
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  if (hasTourContent(sluggedName)) {
    return sluggedName;
  }

  // Try common variations
  const variations = [
    sluggedName,
    sluggedName.replace(/-temple$/, ''),
    sluggedName.replace(/-shrine$/, ''),
    `${sluggedName}-temple`,
    `${sluggedName}-shrine`,
  ];

  for (const variation of variations) {
    if (hasTourContent(variation)) {
      return variation;
    }
  }

  return null;
}

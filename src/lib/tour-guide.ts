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
 * Map activity categories to locationId patterns for tour content.
 * Returns potential locationIds based on activity name and category.
 */
export function getLocationIdForActivity(
  activityName: string,
  category: string
): string | null {
  // Only provide tour content for cultural categories
  if (!['temple', 'activity', 'food'].includes(category.toLowerCase())) {
    return null;
  }

  // Normalize activity name to create locationId
  const normalizedName = activityName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  // Check if we have content for this normalized name
  if (hasTourContent(normalizedName)) {
    return normalizedName;
  }

  // Try common variations
  const variations = [
    normalizedName,
    normalizedName.replace(/-temple$/, ''),
    normalizedName.replace(/-shrine$/, ''),
    `${normalizedName}-temple`,
    `${normalizedName}-shrine`,
  ];

  for (const variation of variations) {
    if (hasTourContent(variation)) {
      return variation;
    }
  }

  return null;
}

/**
 * Database seeding utility for FTC: Nihon
 * Seeds IndexedDB with trip data for development/testing
 */

import { db } from './database';
// Import from TypeScript seed file (single source of truth)
import {
  accommodations,
  activities,
  transitSegments,
  tripInfo,
  flights,
  tickets,
  dayInfo,
  attractions,
  shoppingLocations,
  restaurants,
  transportRoutes,
  checklistItems,
} from './seed-data';
// Import comprehensive phrases from dedicated file
import { PHRASES as phrases } from './seed-phrases';

/**
 * Data version - increment this when seed data changes to trigger a reseed
 * This allows updating phrases/data without users needing to clear their browser data
 */
const DATA_VERSION = 3; // Incremented: added Japan travel prep checklist items
const DATA_VERSION_KEY = 'ftc-nihon-data-version';

/**
 * Check if database is already seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  const activityCount = await db.activities.count();
  return activityCount > 0;
}

/**
 * Check if data version has changed and phrases need reseeding
 */
function getStoredDataVersion(): number {
  if (typeof window === 'undefined') return DATA_VERSION;
  const stored = localStorage.getItem(DATA_VERSION_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

function setStoredDataVersion(version: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DATA_VERSION_KEY, version.toString());
}

/**
 * Reseed just the phrases table (for data version updates)
 */
async function reseedPhrases(): Promise<void> {
  console.log('[Seed] Reseeding phrases due to data version change...');
  await db.phrases.clear();
  await db.phrases.bulkAdd(phrases);
  console.log(`[Seed] Reseeded ${phrases.length} phrases`);
}

/**
 * Reseed just the checklist items table (for data version updates)
 */
async function reseedChecklistItems(): Promise<void> {
  console.log('[Seed] Reseeding checklist items due to data version change...');
  await db.checklistItems.clear();
  await db.checklistItems.bulkAdd(checklistItems);
  console.log(`[Seed] Reseeded ${checklistItems.length} checklist items`);
}

/**
 * Check and update data if version changed
 */
export async function checkDataVersion(): Promise<void> {
  const storedVersion = getStoredDataVersion();

  if (storedVersion < DATA_VERSION) {
    console.log(`[Seed] Data version changed: ${storedVersion} -> ${DATA_VERSION}`);

    // Reseed phrases (most commonly updated)
    await reseedPhrases();

    // Reseed checklist items (Japan travel prep)
    await reseedChecklistItems();

    // Update stored version
    setStoredDataVersion(DATA_VERSION);
  }
}

/**
 * Seed the database with trip data
 * Only seeds if database is empty
 */
export async function seedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if already seeded
    const isSeeded = await isDatabaseSeeded();
    if (isSeeded) {
      return { success: true, message: 'Database already seeded' };
    }

    console.log('[Seed] Starting database seed...');

    // Clear existing data (in case of partial seed)
    // Note: mealSelections is NOT cleared - it preserves user selections
    await db.transaction(
      'rw',
      [
        db.activities,
        db.accommodations,
        db.transitSegments,
        db.tripInfo,
        db.flights,
        db.tickets,
        db.dayInfo,
        db.attractions,
        db.shoppingLocations,
        db.restaurants,
        db.phrases,
        db.transportRoutes,
        db.checklistItems,
      ],
      async () => {
        await db.activities.clear();
        await db.accommodations.clear();
        await db.transitSegments.clear();
        await db.tripInfo.clear();
        await db.flights.clear();
        await db.tickets.clear();
        await db.dayInfo.clear();
        await db.attractions.clear();
        await db.shoppingLocations.clear();
        await db.restaurants.clear();
        await db.phrases.clear();
        await db.transportRoutes.clear();
        await db.checklistItems.clear();
      }
    );

    // Seed core data
    console.log(`[Seed] Adding ${accommodations.length} accommodations...`);
    await db.accommodations.bulkAdd(accommodations);

    console.log(`[Seed] Adding ${activities.length} activities...`);
    await db.activities.bulkAdd(activities);

    console.log(`[Seed] Adding ${transitSegments.length} transit segments...`);
    await db.transitSegments.bulkAdd(transitSegments);

    // Seed enriched data (v2)
    console.log(`[Seed] Adding ${tripInfo.length} trip info records...`);
    await db.tripInfo.bulkAdd(tripInfo);

    console.log(`[Seed] Adding ${flights.length} flights...`);
    await db.flights.bulkAdd(flights);

    console.log(`[Seed] Adding ${tickets.length} tickets...`);
    await db.tickets.bulkAdd(tickets);

    console.log(`[Seed] Adding ${dayInfo.length} day info records...`);
    await db.dayInfo.bulkAdd(dayInfo);

    console.log(`[Seed] Adding ${attractions.length} attractions...`);
    await db.attractions.bulkAdd(attractions);

    console.log(`[Seed] Adding ${shoppingLocations.length} shopping locations...`);
    await db.shoppingLocations.bulkAdd(shoppingLocations);

    console.log(`[Seed] Adding ${restaurants.length} restaurants...`);
    await db.restaurants.bulkAdd(restaurants);

    console.log(`[Seed] Adding ${phrases.length} phrases...`);
    await db.phrases.bulkAdd(phrases);

    console.log(`[Seed] Adding ${transportRoutes.length} transport routes...`);
    await db.transportRoutes.bulkAdd(transportRoutes);

    console.log(`[Seed] Adding ${checklistItems.length} checklist items...`);
    await db.checklistItems.bulkAdd(checklistItems);

    console.log('[Seed] Database seeded successfully!');
    return {
      success: true,
      message: `Seeded: ${activities.length} activities, ${accommodations.length} accommodations, ${flights.length} flights, ${tickets.length} tickets, ${dayInfo.length} day info, ${attractions.length} attractions, ${restaurants.length} restaurants, ${phrases.length} phrases, ${checklistItems.length} checklist items`,
    };
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Force reseed the database (clears and reseeds)
 */
export async function reseedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[Seed] Force reseeding database...');

    // Clear all data
    await db.transaction(
      'rw',
      [
        db.activities,
        db.accommodations,
        db.transitSegments,
        db.tripInfo,
        db.flights,
        db.tickets,
        db.dayInfo,
        db.attractions,
        db.shoppingLocations,
        db.restaurants,
        db.phrases,
        db.transportRoutes,
        db.checklistItems,
      ],
      async () => {
        await db.activities.clear();
        await db.accommodations.clear();
        await db.transitSegments.clear();
        await db.tripInfo.clear();
        await db.flights.clear();
        await db.tickets.clear();
        await db.dayInfo.clear();
        await db.attractions.clear();
        await db.shoppingLocations.clear();
        await db.restaurants.clear();
        await db.phrases.clear();
        await db.transportRoutes.clear();
        await db.checklistItems.clear();
      }
    );

    // Seed fresh data
    await db.accommodations.bulkAdd(accommodations);
    await db.activities.bulkAdd(activities);
    await db.transitSegments.bulkAdd(transitSegments);
    await db.tripInfo.bulkAdd(tripInfo);
    await db.flights.bulkAdd(flights);
    await db.tickets.bulkAdd(tickets);
    await db.dayInfo.bulkAdd(dayInfo);
    await db.attractions.bulkAdd(attractions);
    await db.shoppingLocations.bulkAdd(shoppingLocations);
    await db.restaurants.bulkAdd(restaurants);
    await db.phrases.bulkAdd(phrases);
    await db.transportRoutes.bulkAdd(transportRoutes);
    await db.checklistItems.bulkAdd(checklistItems);

    console.log('[Seed] Database reseeded successfully!');
    return {
      success: true,
      message: `Reseeded: ${activities.length} activities, ${accommodations.length} accommodations, ${flights.length} flights, ${tickets.length} tickets, ${dayInfo.length} day info, ${attractions.length} attractions, ${restaurants.length} restaurants, ${phrases.length} phrases, ${checklistItems.length} checklist items`,
    };
  } catch (error) {
    console.error('[Seed] Error reseeding database:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

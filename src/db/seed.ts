/**
 * Database seeding utility for FTC: Nihon
 * Seeds IndexedDB with trip data for development/testing
 */

import { db } from './database';
import { accommodations, activities, transitSegments } from './seed-data';

/**
 * Check if database is already seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  const activityCount = await db.activities.count();
  return activityCount > 0;
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
    await db.transaction('rw', db.activities, db.accommodations, db.transitSegments, async () => {
      await db.activities.clear();
      await db.accommodations.clear();
      await db.transitSegments.clear();
    });

    // Seed accommodations
    console.log(`[Seed] Adding ${accommodations.length} accommodations...`);
    await db.accommodations.bulkAdd(accommodations);

    // Seed activities
    console.log(`[Seed] Adding ${activities.length} activities...`);
    await db.activities.bulkAdd(activities);

    // Seed transit segments
    console.log(`[Seed] Adding ${transitSegments.length} transit segments...`);
    await db.transitSegments.bulkAdd(transitSegments);

    console.log('[Seed] Database seeded successfully!');
    return {
      success: true,
      message: `Seeded ${activities.length} activities, ${accommodations.length} accommodations, ${transitSegments.length} transit segments`,
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
    await db.transaction('rw', db.activities, db.accommodations, db.transitSegments, async () => {
      await db.activities.clear();
      await db.accommodations.clear();
      await db.transitSegments.clear();
    });

    // Seed fresh data
    await db.accommodations.bulkAdd(accommodations);
    await db.activities.bulkAdd(activities);
    await db.transitSegments.bulkAdd(transitSegments);

    console.log('[Seed] Database reseeded successfully!');
    return {
      success: true,
      message: `Reseeded ${activities.length} activities, ${accommodations.length} accommodations, ${transitSegments.length} transit segments`,
    };
  } catch (error) {
    console.error('[Seed] Error reseeding database:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

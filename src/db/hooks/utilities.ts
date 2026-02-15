/**
 * Utility hooks
 * Alerts, checklist, chat history, phrases, attractions, shopping locations
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database';
import { useSyncVersion } from './sync';
import { getCurrentDate } from '@/lib/utils';
import type {
  Alert,
  ChecklistItem,
  ChatMessage,
  Phrase,
  Attraction,
  ShoppingLocation,
} from '@/types/database';

// ============================================================================
// ALERTS
// ============================================================================

/**
 * Get active alerts (not expired, marked active)
 */
export function useAlerts(): Alert[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate().toISOString();

    const alerts = await db.alerts.where('active').equals(1).toArray();

    // Filter out expired alerts
    return alerts.filter((alert) => !alert.expiresAt || alert.expiresAt > now);
  }, [syncVersion]);
}

/**
 * Get urgent alerts and hard deadlines within specified hours
 */
export function useUrgentAlerts(withinHours: number = 2): Alert[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate();
    const threshold = new Date(now.getTime() + withinHours * 60 * 60 * 1000).toISOString();

    const alerts = await db.alerts.where('active').equals(1).toArray();

    return alerts.filter((alert) => {
      // Always include urgent type
      if (alert.type === 'urgent') return true;

      // Include if it has an expiry within the threshold
      if (alert.expiresAt && alert.expiresAt <= threshold && alert.expiresAt > now.toISOString()) {
        return true;
      }

      return false;
    });
  }, [withinHours, syncVersion]);
}

// ============================================================================
// CHECKLIST
// ============================================================================

/**
 * Get checklist items
 */
export function useChecklistItems(preTripOnly?: boolean): ChecklistItem[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    if (preTripOnly !== undefined) {
      return db.checklistItems.filter((item) => item.isPreTrip === preTripOnly).sortBy('sortOrder');
    }
    return db.checklistItems.orderBy('dueDate').toArray();
  }, [preTripOnly, syncVersion]);
}

/**
 * Get incomplete checklist items
 */
export function useIncompleteChecklist(): ChecklistItem[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () =>
      db.checklistItems
        .filter((item) => item.isCompleted === false)
        .sortBy('dueDate'),
    [syncVersion]
  );
}

/**
 * Get pre-trip checklist items sorted by due date
 */
export function usePreTripChecklist(): ChecklistItem[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () =>
      db.checklistItems
        .filter((item) => item.isPreTrip === true)
        .sortBy('sortOrder'),
    [syncVersion]
  );
}

/**
 * Get critical checklist items (due soon or overdue)
 */
export function useCriticalChecklist(daysAhead: number = 7): ChecklistItem[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    const now = getCurrentDate();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + daysAhead);
    const cutoffStr = cutoff.toISOString().split('T')[0] ?? '';

    const items = await db.checklistItems
      .filter((item) => item.isCompleted === false)
      .toArray();

    // Filter to items due within the threshold
    return items.filter((item) => {
      if (!item.dueDate) return false;
      return item.dueDate <= cutoffStr;
    }).sort((a, b) => {
      // Sort by date, then by sortOrder
      if (a.dueDate && b.dueDate) {
        const dateCompare = a.dueDate.localeCompare(b.dueDate);
        if (dateCompare !== 0) return dateCompare;
      }
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [daysAhead, syncVersion]);
}

// ============================================================================
// CHAT HISTORY
// ============================================================================

/**
 * Get chat history (most recent 50 messages by default)
 */
export function useChatHistory(limit: number = 50): ChatMessage[] | undefined {
  return useLiveQuery(
    () => db.getChatHistory(limit),
    [limit]
  );
}

/**
 * Add a chat message to history
 */
export async function addChatMessage(
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage> {
  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: now,
    createdAt: now,
  };

  await db.addChatMessage(message);
  return message;
}

/**
 * Clear all chat history
 */
export async function clearChatHistory(): Promise<void> {
  await db.clearChatHistory();
}

// ============================================================================
// PHRASES
// ============================================================================

/**
 * Get all Japanese phrases
 */
export function usePhrases(): Phrase[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.phrases.orderBy('sortOrder').toArray(), [syncVersion]);
}

/**
 * Get phrases by category
 */
export function usePhrasesByCategory(category: string): Phrase[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.phrases.where('category').equals(category).sortBy('sortOrder'),
    [category, syncVersion]
  );
}

// ============================================================================
// ATTRACTIONS & SHOPPING
// ============================================================================

/**
 * Get attractions, optionally filtered by city
 */
export function useAttractions(city?: string): Attraction[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(async () => {
    if (city) {
      return db.attractions.where('city').equals(city).toArray();
    }
    return db.attractions.toArray();
  }, [city, syncVersion]);
}

/**
 * Get a specific attraction by ID
 */
export function useAttraction(attractionId: string | null): Attraction | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => (attractionId ? db.attractions.get(attractionId) : undefined),
    [attractionId, syncVersion]
  );
}

/**
 * Get all shopping locations
 */
export function useShoppingLocations(): ShoppingLocation[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(() => db.shoppingLocations.toArray(), [syncVersion]);
}

/**
 * Get shopping locations by city
 */
export function useShoppingLocationsByCity(city: string): ShoppingLocation[] | undefined {
  const syncVersion = useSyncVersion();
  return useLiveQuery(
    () => db.shoppingLocations.where('city').equals(city).toArray(),
    [city, syncVersion]
  );
}

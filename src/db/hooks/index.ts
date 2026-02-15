/**
 * Hooks index - Re-exports all database hooks
 *
 * This module provides a single entry point for all database-related hooks.
 * Import individual modules for tree-shaking optimization.
 */

// Sync version hook (used internally by other hooks)
export { useSyncVersion } from './sync';

// Activity hooks
export {
  useActivities,
  useActivitiesWithTransit,
  useCurrentActivity,
  useNextActivity,
  useNextActivityWithTransit,
  useActivity,
  useActivityWithTransit,
} from './activities';

// Restaurant hooks
export {
  useRestaurants,
  useRestaurantsByCity,
  useRestaurant,
  useRestaurantOptionsForMeal,
  useRestaurantOptionsForDay,
  type RestaurantOptions,
} from './restaurants';

// Meal selection hooks
export {
  useMealSelection,
  useMealSelectionsForDay,
  useSelectedRestaurant,
  setMealSelection,
  clearMealSelection,
} from './meal-selection';

// Accommodation hooks
export {
  useAccommodations,
  useCurrentAccommodation,
  useAccommodationsForDay,
} from './accommodations';

// Trip and day info hooks
export {
  useTripInfo,
  useDayInfo,
  useAllDayInfo,
  useCurrentDayNumber,
  useFlights,
  useFlight,
  useTickets,
  useTicket,
  useUnpurchasedTickets,
  useTransportRoutes,
} from './trip';

// Utility hooks (alerts, checklist, chat, phrases, etc.)
export {
  // Alerts
  useAlerts,
  useUrgentAlerts,
  // Checklist
  useChecklistItems,
  useIncompleteChecklist,
  usePreTripChecklist,
  useCriticalChecklist,
  // Chat
  useChatHistory,
  addChatMessage,
  clearChatHistory,
  // Phrases
  usePhrases,
  usePhrasesByCategory,
  // Attractions & Shopping
  useAttractions,
  useAttraction,
  useShoppingLocations,
  useShoppingLocationsByCity,
} from './utilities';

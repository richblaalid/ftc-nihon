import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/** Schedule view mode: 'day' shows single day, 'all' shows full itinerary */
export type ScheduleViewMode = 'day' | 'all';

interface AppState {
  /** Currently selected trip day (1-15), null means follow current day */
  selectedDay: number | null;
  /** Schedule view mode */
  scheduleViewMode: ScheduleViewMode;

  // Actions
  setSelectedDay: (day: number | null) => void;
  setScheduleViewMode: (mode: ScheduleViewMode) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      selectedDay: null,
      scheduleViewMode: 'day' as ScheduleViewMode,

      // Actions
      setSelectedDay: (day) => set({ selectedDay: day }),
      setScheduleViewMode: (mode) => set({ scheduleViewMode: mode }),
    }),
    {
      name: 'ftc-app-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

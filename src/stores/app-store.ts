import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  /** Currently selected trip day (1-15), null means follow current day */
  selectedDay: number | null;

  // Actions
  setSelectedDay: (day: number | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      selectedDay: null,

      // Actions
      setSelectedDay: (day) => set({ selectedDay: day }),
    }),
    {
      name: 'ftc-app-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

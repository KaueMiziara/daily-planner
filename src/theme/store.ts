import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeMode } from './types';

type ThemeState = {
  mode: ThemeMode;
  packId: string;
  setMode: (mode: ThemeMode) => void;
  setPackId: (packId: string) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      packId: 'default',
      setMode: (mode) => set({ mode }),
      setPackId: (packId) => set({ packId }),
    }),
    {
      name: 'theme-settings',
      storage: createJSONStorage(() => Storage),
      partialize: (s) => ({ mode: s.mode, packId: s.packId }),
    },
  ),
);

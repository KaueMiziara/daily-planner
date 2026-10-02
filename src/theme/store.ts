import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { ThemeMode } from './types';

const syncStorage: StateStorage = {
  getItem: (name) => Storage.getItemSync(name),
  setItem: (name, value) => Storage.setItemSync(name, value),
  removeItem: (name) => Storage.removeItemSync(name),
};

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
      storage: createJSONStorage(() => syncStorage),
      partialize: (s) => ({ mode: s.mode, packId: s.packId }),
    },
  ),
);

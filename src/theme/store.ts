import { create } from 'zustand';
import type { ThemeMode } from './types';

type ThemeState = {
  mode: ThemeMode;
  packId: string;
  setMode: (mode: ThemeMode) => void;
  setPackId: (packId: string) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  packId: 'default',
  setMode: (mode) => set({ mode }),
  setPackId: (packId) => set({ packId }),
}));

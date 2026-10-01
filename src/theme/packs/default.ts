import type { ThemePack } from '../types';

export const defaultPack: ThemePack = {
  id: 'default',
  name: 'Default',
  light: {
    colors: {
      background: '#F7F7FA',
      surface: '#FFFFFF',
      text: '#1B1B1F',
      textMuted: '#6B6B76',
      primary: '#6750A4',
      onPrimary: '#FFFFFF',
      border: '#E2E2E8',
      danger: '#BA1A1A',
      success: '#2E7D32',
      warning: '#B26A00',
    },
  },
  dark: {
    colors: {
      background: '#121216',
      surface: '#1E1E24',
      text: '#ECECF1',
      textMuted: '#9A9AA6',
      primary: '#CFBCFF',
      onPrimary: '#381E72',
      border: '#2E2E38',
      danger: '#FFB4AB',
      success: '#81C784',
      warning: '#FFB74D',
    },
  },
};

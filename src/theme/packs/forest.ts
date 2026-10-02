import type { ThemePack } from '../types';

export const forestPack: ThemePack = {
  id: 'forest',
  name: 'Forest',
  light: {
    colors: {
      background: '#F3F8F4',
      surface: '#FFFFFF',
      text: '#17261C',
      textMuted: '#4F6656',
      primary: '#2E7D4F',
      onPrimary: '#FFFFFF',
      border: '#D3E3D8',
      danger: '#BA1A1A',
      success: '#1B6B35',
      warning: '#8A5300',
    },
  },
  dark: {
    colors: {
      background: '#0F1712',
      surface: '#18241C',
      text: '#E4F0E7',
      textMuted: '#9DB8A5',
      primary: '#7FD6A0',
      onPrimary: '#07381D',
      border: '#2A3B2F',
      danger: '#FFB4AB',
      success: '#81C784',
      warning: '#FFB74D',
    },
  },
};

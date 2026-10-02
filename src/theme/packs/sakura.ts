import type { ThemePack } from '../types';

export const sakuraPack: ThemePack = {
  id: 'sakura',
  name: 'Sakura',
  light: {
    colors: {
      background: '#FFF5F7',
      surface: '#FFFFFF',
      text: '#3A1F2B',
      textMuted: '#7A5565',
      primary: '#C2185B',
      onPrimary: '#FFFFFF',
      border: '#F3D3DD',
      danger: '#B3261E',
      success: '#2E7D32',
      warning: '#8A5300',
    },
  },
  dark: {
    colors: {
      background: '#1B1217',
      surface: '#2A1B23',
      text: '#F6E7ED',
      textMuted: '#C9A6B5',
      primary: '#FF8FB5',
      onPrimary: '#4A0F27',
      border: '#43293A',
      danger: '#FFB4AB',
      success: '#81C784',
      warning: '#FFB74D',
    },
  },
};

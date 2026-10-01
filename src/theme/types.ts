import type { ImageSourcePropType } from 'react-native';

export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
};

export type ThemeVariant = {
  colors: ThemeColors;
  backgroundImage?: ImageSourcePropType;
};

export type ThemePack = {
  id: string;
  name: string;
  light: ThemeVariant;
  dark: ThemeVariant;
};

export type ThemeMode = 'system' | 'light' | 'dark';

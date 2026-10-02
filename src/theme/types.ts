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

export type BackgroundSource = number | { uri: string };

export type ThemeBackground = {
  image: BackgroundSource;
  scrim?: number;
};

export type ThemeVariant = {
  colors: ThemeColors;
  background?: ThemeBackground;
};

export type ThemePack = {
  id: string;
  name: string;
  light: ThemeVariant;
  dark: ThemeVariant;
};

export type ThemeMode = 'system' | 'light' | 'dark';

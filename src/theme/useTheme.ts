import { useColorScheme } from 'react-native';
import { getPack } from './packs';
import { useThemeStore } from './store';
import { radius, spacing, typography } from './tokens';

export function useTheme() {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const packId = useThemeStore((s) => s.packId);

  const scheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const variant = getPack(packId)[scheme];

  return {
    scheme,
    colors: variant.colors,
    background: variant.background,
    spacing,
    radius,
    typography,
  };
}

import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'compact' | 'medium' | 'expanded';

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width < 600) return 'compact';
  if (width < 840) return 'medium';
  return 'expanded';
}

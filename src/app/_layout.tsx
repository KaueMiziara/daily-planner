import { useTheme } from '@/theme/useTheme';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const { scheme, colors } = useTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

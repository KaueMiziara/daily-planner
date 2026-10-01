import { useTheme } from '@/theme/useTheme';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/lib/db';
import migrations from '../../drizzle/migrations';
import { ActivityIndicator, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';

export default function RootLayout() {
  const { scheme, colors } = useTheme();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 24,
          backgroundColor: colors.background,
        }}
      >
        <AppText variant="heading">Database error</AppText>
        <AppText muted>{error.message}</AppText>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

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

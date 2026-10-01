import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';

export default function TodayScreen() {
  return (
    <Screen>
      <AppText variant="title">Today</AppText>
      <AppText muted>Your tasks will show up here.</AppText>
    </Screen>
  );
}

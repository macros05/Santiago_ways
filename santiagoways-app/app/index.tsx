import { Redirect } from 'expo-router';
import { useAuth } from '@stores/auth';

export default function Index() {
  const user = useAuth((s) => s.user);
  const isReady = useAuth((s) => s.isReady);
  if (!isReady) return null;
  if (user) return <Redirect href="/(tabs)/explore" />;
  return <Redirect href="/(onboarding)/welcome" />;
}

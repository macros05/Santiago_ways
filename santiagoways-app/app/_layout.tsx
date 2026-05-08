import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@lib/queryClient';
import { useAuth } from '@stores/auth';
import { useSubscription } from '@stores/subscription';
import { usePrefs } from '@stores/prefs';
import { ToastHost } from '@components/Toast';
import { colors } from '@design/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const bootstrap = useAuth((s) => s.bootstrap);
  const isReady = useAuth((s) => s.isReady);
  const user = useAuth((s) => s.user);
  const initSub = useSubscription((s) => s.initialize);
  const resetSub = useSubscription((s) => s.reset);
  const hydratePrefs = usePrefs((s) => s.hydrate);

  useEffect(() => {
    Promise.all([bootstrap(), hydratePrefs()]).finally(() =>
      SplashScreen.hideAsync().catch(() => {}),
    );
  }, [bootstrap, hydratePrefs]);

  useEffect(() => {
    if (user?.id) {
      initSub(user.id);
    } else {
      resetSub();
    }
  }, [user?.id, initSub, resetSub]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.stone950 },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="stage/[id]" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="albergue/[id]" />
            <Stack.Screen name="post/[id]" />
            <Stack.Screen name="plans" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="ai-guide" />
            <Stack.Screen name="health-dashboard" />
            <Stack.Screen name="chat/index" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="settings" />
          </Stack>
          {isReady ? <ToastHost /> : null}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

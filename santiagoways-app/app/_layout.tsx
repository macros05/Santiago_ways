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
import { useAppFonts } from '@design/useAppFonts';
import { startAnalytics, stopAnalytics, flush as flushAnalytics } from '@lib/analytics';
// Side-effect import: registers TaskManager.defineTask at the top level so
// the background GPS task is available as soon as the JS bundle loads.
import '@lib/backgroundTask';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const bootstrap = useAuth((s) => s.bootstrap);
  const isReady = useAuth((s) => s.isReady);
  const user = useAuth((s) => s.user);
  const initSub = useSubscription((s) => s.initialize);
  const resetSub = useSubscription((s) => s.reset);
  const hydratePrefs = usePrefs((s) => s.hydrate);
  // Display font (Fraunces). Body/UI uses the system font, so we never block the
  // splash indefinitely on this — `fontsReady` flips on success OR failure.
  const [fontsLoaded, fontError] = useAppFonts();
  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    Promise.all([bootstrap(), hydratePrefs()]).finally(() => {
      if (fontsReady) SplashScreen.hideAsync().catch(() => {});
    });
    startAnalytics();
    return () => {
      // Best-effort flush on unmount.
      void flushAnalytics();
      stopAnalytics();
    };
  }, [bootstrap, hydratePrefs, fontsReady]);

  useEffect(() => {
    if (fontsReady && isReady) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady, isReady]);

  useEffect(() => {
    if (user?.id) {
      initSub(user.id);
    } else {
      resetSub();
    }
  }, [user?.id, initSub, resetSub]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ink }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.ink },
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
            <Stack.Screen name="diary/index" />
            <Stack.Screen name="diary/new" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="diary/[id]" />
            <Stack.Screen name="credential/index" />
            <Stack.Screen name="credential/add" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="practical/index" />
          </Stack>
          {isReady ? <ToastHost /> : null}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

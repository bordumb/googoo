import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { IS_MOCK, ServiceProvider } from "@/services/provider";
import { useAuthStore } from "@/stores/authStore";
import { useLocationStore } from "@/stores/locationStore";

const queryClient = new QueryClient(
  IS_MOCK
    ? {
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
          },
        },
      }
    : {},
);

function MockInitializer() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setCoords = useLocationStore((s) => s.setCoords);

  useEffect(() => {
    if (!IS_MOCK) return;

    // Lazy import fixtures only in mock mode
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MOCK_CURRENT_USER } = require("@/fixtures") as {
      MOCK_CURRENT_USER: { id: string; display_name: string; avatar_url: string | null; bio: string | null; neighborhood: string | null; kid_ages: string[]; push_token: string | null; created_at: string; updated_at: string };
    };

    setSession({ user: { id: MOCK_CURRENT_USER.id } });
    setProfile(MOCK_CURRENT_USER);
    // Tacoma, WA — matches README launch market
    setCoords(47.2529, -122.4443);
  }, [setSession, setProfile, setCoords]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ServiceProvider>
        <QueryClientProvider client={queryClient}>
          <MockInitializer />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="listing/[id]" options={{ headerShown: true, title: "" }} />
            <Stack.Screen
              name="listing/create"
              options={{ presentation: "modal", headerShown: true, title: "New Listing" }}
            />
            <Stack.Screen name="profile/[id]" options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="messages/index" options={{ headerShown: true, title: "Messages" }} />
            <Stack.Screen name="messages/[threadId]" options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="group/[id]" options={{ headerShown: true, title: "" }} />
            <Stack.Screen name="auth/sign-in" />
            <Stack.Screen name="auth/sign-up" />
            <Stack.Screen name="onboarding/index" />
          </Stack>
          <StatusBar style="dark" />
        </QueryClientProvider>
      </ServiceProvider>
    </GestureHandlerRootView>
  );
}

import { useEffect, useState } from "react";

import type { Profile } from "@googoo/shared";

import { IS_MOCK } from "@/services/provider";
import { getSupabase } from "@/services/supabase";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(IS_MOCK);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (IS_MOCK) {
      // Mock mode: auth store is pre-populated by ServiceProvider
      setIsLoading(false);
      return;
    }

    getSupabase()
      .auth.getSession()
      .then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isLoading, isAuthenticated, profile };
}

import { create } from "zustand";

import type { Profile } from "@googoo/shared";

interface AuthState {
  session: { user: { id: string } } | null;
  profile: Profile | null;
  setSession: (session: AuthState["session"]) => void;
  setProfile: (profile: Profile | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  clear: () => set({ session: null, profile: null }),
}));

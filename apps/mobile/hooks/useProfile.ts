import { useQuery } from "@tanstack/react-query";

import type { Profile } from "@googoo/shared";

export function useProfile(id: string) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async (): Promise<Profile | null> => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MOCK_PROFILES } = require("@/fixtures") as {
        MOCK_PROFILES: Profile[];
      };
      return MOCK_PROFILES.find((p) => p.id === id) ?? null;
    },
    enabled: !!id,
  });
}

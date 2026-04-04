import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";
import { useLocationStore } from "@/stores/locationStore";

export function useNearbyListings() {
  const { lat, lng, radiusMeters } = useLocationStore();
  const { listings } = useServices();

  return useQuery({
    queryKey: ["listings", "nearby", lat, lng, radiusMeters],
    queryFn: () =>
      listings.fetchNearby({ lat, lng, radiusMeters, limit: 20, offset: 0 }),
    enabled: lat !== 0 && lng !== 0,
  });
}

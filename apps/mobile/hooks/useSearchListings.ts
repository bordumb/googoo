import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";
import { useLocationStore } from "@/stores/locationStore";
import { useSearchStore } from "@/stores/searchStore";

export function useSearchListings() {
  const { listings } = useServices();
  const { lat, lng } = useLocationStore();
  const { query, filters } = useSearchStore();

  return useQuery({
    queryKey: ["listings", "search", query, filters, lat, lng],
    queryFn: () =>
      listings.search({
        query,
        lat,
        lng,
        radiusMeters: filters.maxDistance,
        limit: 20,
        offset: 0,
      }),
    enabled: lat !== 0 && lng !== 0 && query.length > 0,
  });
}

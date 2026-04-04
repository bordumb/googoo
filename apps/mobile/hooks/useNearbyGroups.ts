import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";
import { useLocationStore } from "@/stores/locationStore";

export function useNearbyGroups() {
  const { lat, lng } = useLocationStore();
  const { groups } = useServices();

  return useQuery({
    queryKey: ["groups", "nearby", lat, lng],
    queryFn: () => groups.fetchNearby(lat, lng),
    enabled: lat !== 0 && lng !== 0,
  });
}

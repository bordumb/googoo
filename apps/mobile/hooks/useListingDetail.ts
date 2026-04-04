import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";

export function useListingDetail(id: string) {
  const { listings } = useServices();

  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => listings.fetchById(id),
    enabled: !!id,
  });
}

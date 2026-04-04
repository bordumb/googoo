import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";

export function useThreads() {
  const { messages } = useServices();

  return useQuery({
    queryKey: ["threads"],
    queryFn: () => messages.fetchThreads(),
  });
}

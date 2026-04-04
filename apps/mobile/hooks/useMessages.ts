import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";

export function useMessages(threadId: string) {
  const { messages } = useServices();

  return useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => messages.fetchThread(threadId),
    enabled: !!threadId,
  });
}

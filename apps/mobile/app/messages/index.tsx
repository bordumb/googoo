import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { MessageSquare } from "lucide-react-native";

import { ThreadRow } from "@/components/messages/ThreadRow";
import { EmptyState, ThreadRowSkeleton } from "@/components/ui";
import { useThreads } from "@/hooks/useThreads";

export default function InboxScreen() {
  const router = useRouter();
  const { data: threads, isLoading } = useThreads();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        {Array.from({ length: 6 }, (_, i) => (
          <ThreadRowSkeleton key={i} />
        ))}
      </View>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="Browse listings and start a conversation!"
        actionLabel="Browse listings"
        onAction={() => router.push("/(tabs)")}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThreadRow
            thread={item}
            onPress={() => router.push(`/messages/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

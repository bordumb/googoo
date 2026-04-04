import { useLocalSearchParams } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react-native";

import { Avatar } from "@/components/common/Avatar";
import { PostCard } from "@/components/community/PostCard";
import { Skeleton } from "@/components/ui";
import { useServices } from "@/services/provider";

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { groups } = useServices();

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => groups.fetchById(id),
    enabled: !!id,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["group", id, "posts"],
    queryFn: () => groups.fetchPosts(id),
    enabled: !!id,
  });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MOCK_PROFILES } = require("@/fixtures") as {
    MOCK_PROFILES: Array<{ id: string; display_name: string; avatar_url: string | null }>;
  };

  if (groupLoading) {
    return (
      <View className="flex-1 bg-background p-4">
        <Skeleton width="60%" height={24} />
        <Skeleton width="100%" height={40} className="mt-3" />
        <Skeleton width="100%" height={80} className="mt-4" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={posts ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="mb-4">
            {/* Group header */}
            <View className="mb-4 rounded-card bg-white p-4 shadow-sm">
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users size={24} color="#6B8F71" />
                </View>
                <View className="ml-3">
                  <Text className="text-xl font-bold text-text">
                    {group?.name ?? "Group"}
                  </Text>
                  {group?.description && (
                    <Text className="mt-0.5 text-sm text-neutral-400">
                      {group.description}
                    </Text>
                  )}
                </View>
              </View>

              {/* Member avatars */}
              <View className="mt-3 flex-row items-center">
                {MOCK_PROFILES.slice(0, 5).map((p, i) => (
                  <View key={p.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                    <Avatar uri={p.avatar_url} size={28} />
                  </View>
                ))}
                <Text className="ml-2 text-sm text-neutral-400">
                  {MOCK_PROFILES.length}+ members
                </Text>
              </View>
            </View>

            <Text className="mb-2 text-sm font-semibold text-neutral-500">
              Recent Posts
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const author = MOCK_PROFILES.find((p) => p.id === item.author_id);
          return (
            <PostCard
              post={item}
              authorName={author?.display_name}
              authorAvatar={author?.avatar_url}
            />
          );
        }}
        ListEmptyComponent={
          postsLoading ? (
            <View>
              {Array.from({ length: 3 }, (_, i) => (
                <View key={i} className="mb-3 rounded-card bg-white p-4">
                  <Skeleton width="40%" height={14} />
                  <Skeleton width="100%" height={40} className="mt-2" />
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-neutral-400">
                No posts yet. Be the first!
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

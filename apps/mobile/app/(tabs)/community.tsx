import { useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, MessageSquareText, Users } from "lucide-react-native";

import { GroupCard } from "@/components/community/GroupCard";
import { PostCard } from "@/components/community/PostCard";
import { Skeleton } from "@/components/ui";
import { useNearbyGroups } from "@/hooks/useNearbyGroups";
import { useLocation } from "@/hooks/useLocation";

type Tab = "groups" | "discussions" | "events";

export default function CommunityScreen() {
  useLocation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("groups");
  const { data: groups, isLoading: groupsLoading } = useNearbyGroups();

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fixtures = require("@/fixtures") as {
    MOCK_POSTS: Array<{ id: string; group_id: string; author_id: string; content: string; images: string[] | null; parent_id: string | null; created_at: string }>;
    MOCK_PROFILES: Array<{ id: string; display_name: string; avatar_url: string | null }>;
    MOCK_EVENTS: Array<{ id: string; group_name: string; title: string; address: string; starts_at: string; attendee_count: number }>;
    MOCK_GROUPS: Array<{ id: string; name: string }>;
  };

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "groups", label: "Groups", icon: Users },
    { key: "discussions", label: "Discussions", icon: MessageSquareText },
    { key: "events", label: "Events", icon: Calendar },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Tab bar */}
      <View className="flex-row border-b border-neutral-200 bg-white px-4">
        {tabs.map(({ key, label, icon: Icon }) => (
          <Pressable
            key={key}
            onPress={() => setActiveTab(key)}
            className={`flex-1 flex-row items-center justify-center gap-1 py-3 ${
              activeTab === key
                ? "border-b-2 border-primary"
                : ""
            }`}
          >
            <Icon
              size={16}
              color={activeTab === key ? "#6B8F71" : "#8F8A84"}
            />
            <Text
              className={`text-sm font-medium ${
                activeTab === key ? "text-primary" : "text-neutral-400"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "groups" && (
        groupsLoading ? (
          <View className="p-4">
            {Array.from({ length: 4 }, (_, i) => (
              <View key={i} className="mb-3 rounded-card bg-white p-4">
                <Skeleton width="60%" height={18} />
                <Skeleton width="90%" height={14} className="mt-2" />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListHeaderComponent={
              <Text className="mb-3 text-lg font-semibold text-text">
                Your Groups
              </Text>
            }
            renderItem={({ item }) => (
              <GroupCard
                group={item}
                onPress={() => router.push(`/group/${item.id}`)}
                showJoin
                initialJoined={Math.random() > 0.5}
              />
            )}
          />
        )
      )}

      {activeTab === "discussions" && (
        <FlatList
          data={fixtures.MOCK_POSTS.slice(0, 10)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const author = fixtures.MOCK_PROFILES.find(
              (p) => p.id === item.author_id,
            );
            const group = fixtures.MOCK_GROUPS.find(
              (g) => g.id === item.group_id,
            );
            return (
              <PostCard
                post={item}
                authorName={author?.display_name}
                authorAvatar={author?.avatar_url}
                groupName={group?.name}
              />
            );
          }}
        />
      )}

      {activeTab === "events" && (
        <ScrollView className="flex-1 p-4">
          {fixtures.MOCK_EVENTS.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <Calendar size={32} color="#8F8A84" />
              <Text className="mt-2 text-lg font-semibold text-text">
                No upcoming events
              </Text>
              <Text className="mt-1 text-neutral-400">
                Check back soon!
              </Text>
            </View>
          ) : (
            fixtures.MOCK_EVENTS.map((event) => (
              <View
                key={event.id}
                className="mb-3 rounded-card bg-white p-4 shadow-sm"
              >
                <Text className="text-xs font-medium text-primary">
                  {event.group_name}
                </Text>
                <Text className="mt-1 text-base font-semibold text-text">
                  {event.title}
                </Text>
                <Text className="mt-1 text-sm text-neutral-400">
                  {event.address}
                </Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-sm text-primary">
                    {new Date(event.starts_at).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {event.attendee_count} attending
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

import { Image, Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/common/Avatar";
import type { Thread } from "@/fixtures/factories";

interface ThreadRowProps {
  thread: Thread;
  onPress: () => void;
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function ThreadRow({ thread, onPress }: ThreadRowProps) {
  const timeAgo = getTimeAgo(thread.lastMessageAt);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-neutral-100 px-4 py-3"
    >
      <View className="relative">
        <Avatar uri={thread.otherUser.avatar_url} size={48} />
        {thread.unread && (
          <View className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-accent" />
        )}
      </View>

      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-base ${thread.unread ? "font-bold text-text" : "font-medium text-text"}`}
          >
            {thread.otherUser.display_name}
          </Text>
          <Text className="text-xs text-neutral-400">{timeAgo}</Text>
        </View>
        <Text
          className={`mt-0.5 text-sm ${thread.unread ? "font-medium text-text" : "text-neutral-400"}`}
          numberOfLines={1}
        >
          {thread.lastMessage}
        </Text>
        {thread.listingTitle && (
          <Text className="mt-0.5 text-xs text-neutral-300" numberOfLines={1}>
            Re: {thread.listingTitle}
          </Text>
        )}
      </View>

      {thread.listingImage && (
        <Image
          source={{ uri: thread.listingImage }}
          className="ml-2 h-10 w-10 rounded-lg"
        />
      )}
    </Pressable>
  );
}

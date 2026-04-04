import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Heart, MessageCircle, ThumbsUp } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import type { Post } from "@googoo/shared";

import { Avatar } from "@/components/common/Avatar";

interface PostCardProps {
  post: Post;
  authorName?: string;
  authorAvatar?: string | null;
  groupName?: string;
}

export function PostCard({
  post,
  authorName = "Parent",
  authorAvatar,
  groupName,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 12),
  );

  const timeAgo = getTimeAgo(post.created_at);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <View className="mb-3 rounded-card bg-white p-4 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center">
        <Avatar uri={authorAvatar ?? null} size={36} />
        <View className="ml-2 flex-1">
          <Text className="text-sm font-semibold text-text">{authorName}</Text>
          <View className="flex-row items-center">
            {groupName && (
              <Text className="text-xs text-primary">{groupName}</Text>
            )}
            {groupName && (
              <Text className="mx-1 text-xs text-neutral-300">·</Text>
            )}
            <Text className="text-xs text-neutral-400">{timeAgo}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text className="mt-3 text-base leading-relaxed text-text">
        {post.content}
      </Text>

      {/* Actions */}
      <View className="mt-3 flex-row items-center gap-4 border-t border-neutral-100 pt-3">
        <Pressable
          onPress={handleLike}
          className="flex-row items-center"
        >
          {liked ? (
            <Heart size={18} color="#E8836B" fill="#E8836B" />
          ) : (
            <Heart size={18} color="#8F8A84" />
          )}
          <Text
            className={`ml-1 text-sm ${liked ? "text-accent" : "text-neutral-400"}`}
          >
            {likeCount}
          </Text>
        </Pressable>

        <View className="flex-row items-center">
          <MessageCircle size={18} color="#8F8A84" />
          <Text className="ml-1 text-sm text-neutral-400">
            {Math.floor(Math.random() * 5)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

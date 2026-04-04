import { Text, View } from "react-native";
import { ThumbsUp, ThumbsDown } from "lucide-react-native";

import { Avatar } from "@/components/common/Avatar";
import type { MockReview } from "@/fixtures/factories";

interface ReviewCardProps {
  review: MockReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const timeAgo = getTimeAgo(review.created_at);

  return (
    <View className="flex-row py-3 border-b border-neutral-100">
      <Avatar uri={review.reviewer_avatar} size={36} />
      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-text">
            {review.reviewer_name}
          </Text>
          <Text className="text-xs text-neutral-400">{timeAgo}</Text>
        </View>
        <View className="mt-1 flex-row items-center">
          {review.rating ? (
            <ThumbsUp size={14} color="#6B8F71" fill="#6B8F71" />
          ) : (
            <ThumbsDown size={14} color="#E53935" fill="#E53935" />
          )}
          <Text className="ml-1 text-xs text-neutral-400">
            {review.rating ? "Positive" : "Negative"}
          </Text>
        </View>
        {review.comment && (
          <Text className="mt-1 text-sm text-neutral-500">
            {review.comment}
          </Text>
        )}
      </View>
    </View>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

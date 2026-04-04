import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Avatar } from "@/components/common/Avatar";

interface MessageBubbleProps {
  content: string;
  isSent: boolean;
  senderAvatar?: string | null;
  showAvatar?: boolean;
  isRead?: boolean;
  timestamp: string;
}

export function MessageBubble({
  content,
  isSent,
  senderAvatar,
  showAvatar = false,
  isRead,
  timestamp,
}: MessageBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify()}
      className={`mb-2 flex-row ${isSent ? "justify-end" : "justify-start"}`}
    >
      {!isSent && showAvatar && (
        <Avatar uri={senderAvatar ?? null} size={28} />
      )}
      {!isSent && !showAvatar && <View className="w-7" />}

      <View
        className={`ml-2 max-w-[75%] rounded-2xl px-3 py-2 ${
          isSent ? "rounded-br-sm bg-primary" : "rounded-bl-sm bg-white"
        }`}
      >
        <Text className={`text-base ${isSent ? "text-white" : "text-text"}`}>
          {content}
        </Text>
        <View
          className={`mt-0.5 flex-row items-center ${isSent ? "justify-end" : ""}`}
        >
          <Text
            className={`text-xs ${isSent ? "text-white/60" : "text-neutral-300"}`}
          >
            {time}
          </Text>
          {isSent && isRead && (
            <Text className="ml-1 text-xs text-white/60">Read</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

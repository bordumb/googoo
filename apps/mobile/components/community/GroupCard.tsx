import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Check, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { Group } from "@googoo/shared";

import { Badge } from "@/components/common/Badge";

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  showJoin?: boolean;
  initialJoined?: boolean;
}

export function GroupCard({
  group,
  onPress,
  showJoin = false,
  initialJoined = false,
}: GroupCardProps) {
  const [joined, setJoined] = useState(initialJoined);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(1.05, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 150);
    setJoined(!joined);
  };

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-card bg-white p-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Users size={18} color="#6B8F71" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-text">{group.name}</Text>
            <Badge
              label={group.is_geographic ? "Local" : "Interest"}
              variant={group.is_geographic ? "primary" : "accent"}
            />
          </View>
        </View>

        {showJoin && (
          <Animated.View style={animatedStyle}>
            <Pressable
              onPress={handleJoin}
              className={`flex-row items-center rounded-full px-3 py-1.5 ${
                joined ? "bg-primary" : "border border-primary bg-white"
              }`}
            >
              {joined && <Check size={14} color="#fff" />}
              <Text
                className={`text-sm font-medium ${joined ? "ml-1 text-white" : "text-primary"}`}
              >
                {joined ? "Joined" : "Join"}
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
      {group.description && (
        <Text className="mt-2 text-sm text-neutral-400" numberOfLines={2}>
          {group.description}
        </Text>
      )}
    </Pressable>
  );
}

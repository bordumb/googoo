import { useEffect } from "react";
import { type DimensionValue, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  rounded?: boolean;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 20,
  rounded = false,
  className = "",
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width, height }, animatedStyle]}
      className={`bg-neutral-200 ${rounded ? "rounded-full" : "rounded-md"} ${className}`}
    />
  );
}

/**
 * Pre-composed skeleton matching the ListingCard layout.
 */
export function ListingCardSkeleton() {
  return (
    <View className="mb-3 overflow-hidden rounded-card bg-white shadow-sm">
      {/* Hero image placeholder */}
      <Skeleton width="100%" height={0} className="aspect-[3/2]" />

      <View className="p-3">
        {/* Title + badge row */}
        <View className="flex-row items-center justify-between">
          <Skeleton width="60%" height={18} />
          <Skeleton width={50} height={22} rounded />
        </View>

        {/* Distance */}
        <View className="mt-2">
          <Skeleton width={80} height={14} />
        </View>

        {/* Seller row */}
        <View className="mt-2 flex-row items-center">
          <Skeleton width={24} height={24} rounded />
          <View className="ml-2">
            <Skeleton width={100} height={14} />
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Pre-composed skeleton matching a message thread row.
 */
export function ThreadRowSkeleton() {
  return (
    <View className="flex-row items-center px-4 py-3">
      {/* Avatar */}
      <Skeleton width={48} height={48} rounded />

      <View className="ml-3 flex-1">
        {/* Name */}
        <Skeleton width="50%" height={16} />
        {/* Last message */}
        <View className="mt-1.5">
          <Skeleton width="80%" height={14} />
        </View>
      </View>

      {/* Timestamp */}
      <Skeleton width={40} height={12} />
    </View>
  );
}

import { Image, Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { NearbyListing } from "@googoo/shared";
import { formatDistance, formatPrice } from "@googoo/shared";

import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ListingCardProps {
  listing: NearbyListing;
  onPress: () => void;
}

export function ListingCard({ listing, onPress }: ListingCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const priceBadge =
    listing.listing_type === "swap"
      ? "Swap"
      : listing.listing_type === "free"
        ? "Free"
        : formatPrice(listing.price_cents);

  const badgeVariant =
    listing.listing_type === "swap"
      ? "primary"
      : listing.listing_type === "free"
        ? "accent"
        : "neutral";

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="mb-3 overflow-hidden rounded-card bg-white shadow-sm"
      style={animatedStyle}
    >
      {/* Hero image — 3:2 aspect ratio */}
      <Image
        source={{ uri: listing.images[0] }}
        className="w-full bg-neutral-200"
        style={{ aspectRatio: 3 / 2 }}
      />

      <View className="p-3">
        {/* Title + Badge */}
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-base font-semibold text-text" numberOfLines={1}>
            {listing.title}
          </Text>
          <Badge label={priceBadge} variant={badgeVariant} />
        </View>

        {/* Distance */}
        <Text className="mt-1 text-sm text-neutral-400">
          {formatDistance(listing.distance_m)}
        </Text>

        {/* Seller row */}
        <View className="mt-2 flex-row items-center">
          <Avatar uri={listing.seller_avatar_url} size={24} />
          <Text className="ml-2 text-sm text-neutral-500">
            {listing.seller_display_name}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

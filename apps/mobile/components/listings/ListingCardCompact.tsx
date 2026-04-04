import { Image, Pressable, Text, View } from "react-native";

import type { NearbyListing } from "@googoo/shared";
import { formatPrice } from "@googoo/shared";

import { Badge } from "@/components/common/Badge";

interface ListingCardCompactProps {
  listing: NearbyListing;
  onPress: () => void;
}

export function ListingCardCompact({ listing, onPress }: ListingCardCompactProps) {
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
    <Pressable
      onPress={onPress}
      className="flex-1 overflow-hidden rounded-card bg-white shadow-sm"
    >
      <Image
        source={{ uri: listing.images[0] }}
        className="w-full bg-neutral-200"
        style={{ aspectRatio: 1 }}
      />
      <View className="p-2">
        <Text className="text-sm font-medium text-text" numberOfLines={1}>
          {listing.title}
        </Text>
        <Badge label={priceBadge} variant={badgeVariant} />
      </View>
    </Pressable>
  );
}

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  MapPin,
  ArrowLeftRight,
  Clock,
  Tag,
  Truck,
  Star,
} from "lucide-react-native";
import { ScrollView, Text, View, Pressable } from "react-native";

import { formatDistance, formatPrice } from "@googoo/shared";

import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import {
  Button,
  StickyBottomBar,
  ImageCarousel,
  Skeleton,
} from "@/components/ui";
import { useListingDetail } from "@/hooks/useListingDetail";

const CONDITION_LABELS: Record<string, string> = {
  new_with_tags: "New with tags",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading } = useListingDetail(id);

  if (isLoading || !listing) {
    return (
      <View className="flex-1 bg-background">
        <Skeleton height={300} />
        <View className="p-4">
          <Skeleton width="60%" height={24} className="mt-4" />
          <Skeleton width="30%" height={20} className="mt-3" />
          <Skeleton width="100%" height={60} className="mt-4" />
        </View>
      </View>
    );
  }

  const priceDisplay =
    listing.listing_type === "swap"
      ? "Swap"
      : listing.listing_type === "free"
        ? "Free"
        : formatPrice(listing.price_cents);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ImageCarousel images={listing.images} height={320} />

        <View className="p-4">
          {/* Price + Badges */}
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-bold text-text">{priceDisplay}</Text>
            <Badge
              label={CONDITION_LABELS[listing.condition] ?? listing.condition}
              variant="neutral"
            />
            {listing.age_range && (
              <Badge
                label={listing.age_range.replace(/_/g, "-")}
                variant="neutral"
              />
            )}
          </View>

          {/* Title */}
          <Text className="mt-2 text-xl font-semibold text-text">
            {listing.title}
          </Text>

          {/* Seller Row */}
          <Pressable
            className="mt-4 flex-row items-center rounded-card bg-white p-3 shadow-sm"
            onPress={() => router.push(`/profile/${listing.seller_id}`)}
          >
            <Avatar uri={listing.seller_avatar_url} size={44} />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-text">
                {listing.seller_display_name}
              </Text>
              <View className="flex-row items-center">
                <Star size={12} color="#6B8F71" fill="#6B8F71" />
                <Text className="ml-1 text-sm text-neutral-400">
                  4.8 rating
                </Text>
              </View>
            </View>
            <Text className="text-sm text-neutral-400">
              {formatDistance(listing.distance_m)}
            </Text>
          </Pressable>

          {/* Description */}
          {listing.description && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-neutral-500">
                Description
              </Text>
              <Text className="mt-1 text-base leading-relaxed text-text">
                {listing.description}
              </Text>
            </View>
          )}

          {/* Swap preferences */}
          {listing.listing_type === "swap" && listing.swap_preferences && (
            <View className="mt-4 rounded-card bg-primary/10 p-3">
              <View className="flex-row items-center">
                <ArrowLeftRight size={16} color="#6B8F71" />
                <Text className="ml-2 text-sm font-semibold text-primary">
                  Looking to swap for
                </Text>
              </View>
              <Text className="mt-1 text-sm text-text">
                {listing.swap_preferences}
              </Text>
            </View>
          )}

          {/* Details Grid */}
          <View className="mt-4 flex-row flex-wrap">
            <DetailItem icon={Tag} label="Category" value={listing.category} />
            <DetailItem
              icon={Star}
              label="Condition"
              value={
                CONDITION_LABELS[listing.condition] ?? listing.condition
              }
            />
            <DetailItem
              icon={Truck}
              label="Shipping"
              value={listing.ships ? "Available" : "Local only"}
            />
            <DetailItem
              icon={Clock}
              label="Posted"
              value={new Date(listing.created_at).toLocaleDateString()}
            />
          </View>

          {/* Map preview placeholder */}
          <View className="mt-4 h-32 items-center justify-center rounded-card bg-neutral-100">
            <MapPin size={24} color="#8F8A84" />
            <Text className="mt-1 text-sm text-neutral-400">
              {formatDistance(listing.distance_m)} away
            </Text>
          </View>

          <View className="h-24" />
        </View>
      </ScrollView>

      <StickyBottomBar className="flex-row gap-3">
        <View className="flex-1">
          <Button
            variant="primary"
            fullWidth
            onPress={() => {
              router.push(`/messages/thread-${listing.id}`);
            }}
          >
            Message Seller
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="secondary" fullWidth onPress={() => {}}>
            {listing.listing_type === "swap"
              ? "Propose Swap"
              : "Make an Offer"}
          </Button>
        </View>
      </StickyBottomBar>
    </View>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <View className="w-1/2 flex-row items-center py-2">
      <Icon size={16} color="#8F8A84" />
      <View className="ml-2">
        <Text className="text-xs text-neutral-400">{label}</Text>
        <Text className="text-sm font-medium text-text">{value}</Text>
      </View>
    </View>
  );
}

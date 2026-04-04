import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ThumbsUp, ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";

import type { NearbyListing } from "@googoo/shared";
import type { MockReview } from "@/fixtures/factories";

import { Avatar } from "@/components/common/Avatar";
import { ListingCardCompact } from "@/components/listings/ListingCardCompact";
import { ReviewCard } from "@/components/profile/ReviewCard";
import { StatsRow } from "@/components/profile/StatsRow";
import { Skeleton } from "@/components/ui";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/stores/authStore";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.session?.user.id);
  const isOwnProfile = id === currentUserId;
  const { data: profile, isLoading } = useProfile(id);
  const [showReviews, setShowReviews] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fixtures = require("@/fixtures") as {
    MOCK_LISTINGS: NearbyListing[];
    MOCK_REVIEWS: MockReview[];
    MOCK_GROUPS: Array<{ id: string }>;
  };

  const userListings = fixtures.MOCK_LISTINGS.filter(
    (l) => l.seller_id === id,
  );
  const reviews = fixtures.MOCK_REVIEWS;
  const positiveCount = reviews.filter((r) => r.rating).length;
  const ratingPct =
    reviews.length > 0 ? Math.round((positiveCount / reviews.length) * 100) : 0;

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-background p-4">
        <View className="items-center">
          <Skeleton width={80} height={80} rounded />
          <Skeleton width="40%" height={20} className="mt-3" />
          <Skeleton width="30%" height={14} className="mt-2" />
        </View>
      </View>
    );
  }

  const ListHeader = () => (
    <View>
      {/* Profile header */}
      <View className="items-center pb-4">
        <Avatar uri={profile.avatar_url} size={80} />
        <Text className="mt-3 text-xl font-bold text-text">
          {profile.display_name}
        </Text>
        {profile.neighborhood && (
          <Text className="mt-0.5 text-sm text-neutral-400">
            {profile.neighborhood}
          </Text>
        )}
        <View className="mt-2 flex-row items-center">
          <ThumbsUp size={14} color="#6B8F71" fill="#6B8F71" />
          <Text className="ml-1 text-sm text-primary">
            {ratingPct}% positive ({reviews.length} reviews)
          </Text>
        </View>
        {profile.bio && (
          <Text className="mt-2 text-center text-sm text-neutral-500">
            {profile.bio}
          </Text>
        )}
        <Text className="mt-1 text-xs text-neutral-300">
          Member since{" "}
          {new Date(profile.created_at).toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      {/* Stats */}
      <StatsRow
        stats={[
          { value: userListings.length, label: "Listings" },
          { value: Math.floor(Math.random() * 15) + 1, label: "Transactions" },
          { value: Math.floor(Math.random() * 5) + 1, label: "Groups" },
        ]}
      />

      {/* Reviews accordion */}
      <Pressable
        onPress={() => setShowReviews(!showReviews)}
        className="mt-4 flex-row items-center justify-between rounded-card bg-white p-4 shadow-sm"
      >
        <Text className="text-base font-semibold text-text">
          Reviews ({reviews.length})
        </Text>
        {showReviews ? (
          <ChevronUp size={20} color="#8F8A84" />
        ) : (
          <ChevronDown size={20} color="#8F8A84" />
        )}
      </Pressable>

      {showReviews && (
        <View className="rounded-b-card bg-white px-4 shadow-sm">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      )}

      {/* Listings header */}
      <Text className="mb-3 mt-6 text-base font-semibold text-text">
        {isOwnProfile ? "Your Listings" : "Listings"}
      </Text>
    </View>
  );

  // Pair listings for 2-column grid
  const pairedListings: (NearbyListing | null)[][] = [];
  for (let i = 0; i < userListings.length; i += 2) {
    pairedListings.push([
      userListings[i] ?? null,
      userListings[i + 1] ?? null,
    ]);
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={pairedListings}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={<ListHeader />}
        renderItem={({ item: pair }) => (
          <View className="mb-3 flex-row gap-3">
            {pair.map((listing, i) =>
              listing ? (
                <ListingCardCompact
                  key={listing.id}
                  listing={listing}
                  onPress={() => router.push(`/listing/${listing.id}`)}
                />
              ) : (
                <View key={`empty-${i}`} className="flex-1" />
              ),
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-neutral-400">No listings yet</Text>
          </View>
        }
      />
    </View>
  );
}

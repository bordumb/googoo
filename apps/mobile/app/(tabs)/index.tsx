import { useRouter } from "expo-router";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { ListingCard } from "@/components/listings/ListingCard";
import { FAB } from "@/components/common/FAB";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import { useNearbyListings } from "@/hooks/useNearbyListings";
import { useLocation } from "@/hooks/useLocation";

function ListingSkeleton() {
  return (
    <View className="mb-3 rounded-card bg-white p-3">
      <SkeletonLoader height={180} />
      <View className="mt-3">
        <SkeletonLoader width="70%" height={18} />
      </View>
      <View className="mt-2">
        <SkeletonLoader width="30%" height={14} />
      </View>
      <View className="mt-2 flex-row items-center">
        <SkeletonLoader width={24} height={24} rounded />
        <View className="ml-2">
          <SkeletonLoader width={80} height={14} />
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  useLocation();
  const router = useRouter();
  const { data: listings, isLoading, refetch, isRefetching } = useNearbyListings();

  return (
    <View className="flex-1 bg-background">
      {isLoading ? (
        <View className="px-4 pt-4">
          <ListingSkeleton />
          <ListingSkeleton />
          <ListingSkeleton />
        </View>
      ) : !listings?.length ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-semibold text-text">No listings nearby</Text>
          <Text className="mt-2 text-neutral-400">Be the first to list something!</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={() => router.push(`/listing/${item.id}`)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}

      <FAB onPress={() => router.push("/listing/create")} />
    </View>
  );
}

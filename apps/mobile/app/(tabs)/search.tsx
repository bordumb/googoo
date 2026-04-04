import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import GorhomBottomSheet from "@gorhom/bottom-sheet";
import { Search, SlidersHorizontal, X, PackageSearch } from "lucide-react-native";

import { ListingCard } from "@/components/listings/ListingCard";
import { CategoryGrid } from "@/components/search/CategoryGrid";
import { FilterSheet } from "@/components/search/FilterSheet";
import { Chip, EmptyState, ListingCardSkeleton } from "@/components/ui";
import { useSearchListings } from "@/hooks/useSearchListings";
import { useSearchStore } from "@/stores/searchStore";
import type { CategoryKey } from "@/constants/categories";

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const filterRef = useRef<GorhomBottomSheet>(null);
  const {
    query,
    setQuery,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    filters,
    setFilters,
    activeFilterCount,
  } = useSearchStore();
  const { data: results, isLoading } = useSearchListings();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.length > 0) {
        setIsSearching(true);
      }
    },
    [setQuery],
  );

  const handleSubmit = useCallback(() => {
    if (query.length > 0) {
      addRecentSearch(query);
      setIsSearching(true);
    }
  }, [query, addRecentSearch]);

  const handleCategorySelect = useCallback(
    (category: CategoryKey) => {
      setFilters({ category });
      setQuery(category);
      setIsSearching(true);
      addRecentSearch(category);
    },
    [setFilters, setQuery, addRecentSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setIsSearching(false);
    inputRef.current?.focus();
  }, [setQuery]);

  const filterCount = activeFilterCount();

  return (
    <View className="flex-1 bg-background">
      {/* Search Bar */}
      <View className="border-b border-neutral-200 bg-white px-4 pb-3 pt-2">
        <View className="flex-row items-center rounded-full bg-neutral-50 px-3 py-2">
          <Search size={18} color="#8F8A84" />
          <TextInput
            ref={inputRef}
            className="ml-2 flex-1 text-base text-text"
            placeholder="Search baby gear, clothes, toys..."
            placeholderTextColor="#B8B4AF"
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear}>
              <X size={18} color="#8F8A84" />
            </Pressable>
          )}
        </View>

        {isSearching && (
          <View className="mt-2 flex-row items-center">
            <Pressable
              onPress={() => filterRef.current?.snapToIndex(0)}
              className="flex-row items-center rounded-full bg-neutral-100 px-3 py-1.5"
            >
              <SlidersHorizontal size={14} color="#6B665F" />
              <Text className="ml-1 text-sm text-text">Filters</Text>
              {filterCount > 0 && (
                <View className="ml-1 h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <Text className="text-xs font-bold text-white">
                    {filterCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {!isSearching ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View className="p-4">
              {recentSearches.length > 0 && (
                <View className="mb-6">
                  <Text className="mb-2 text-sm font-semibold text-neutral-500">
                    Recent searches
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        onPress={() => {
                          setQuery(s);
                          setIsSearching(true);
                        }}
                        onDismiss={() => removeRecentSearch(s)}
                      />
                    ))}
                  </View>
                </View>
              )}

              <Text className="mb-3 text-sm font-semibold text-neutral-500">
                Browse categories
              </Text>
              <CategoryGrid
                onSelect={handleCategorySelect}
                selected={filters.category as CategoryKey | null}
              />
            </View>
          }
        />
      ) : isLoading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={() => (
            <View className="px-4 py-2">
              <ListingCardSkeleton />
            </View>
          )}
          keyExtractor={(i) => i.toString()}
        />
      ) : results && results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <Text className="px-4 py-3 text-sm text-neutral-400">
              {results.length} items found
            </Text>
          }
          renderItem={({ item }) => (
            <View className="px-4 py-2">
              <ListingCard
                listing={item}
                onPress={() => router.push(`/listing/${item.id}`)}
              />
            </View>
          )}
        />
      ) : query.length > 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No items found"
          description="Try adjusting your filters or searching for something else."
          actionLabel="Clear search"
          onAction={handleClear}
        />
      ) : null}

      <FilterSheet
        ref={filterRef}
        onApply={() => filterRef.current?.close()}
      />
    </View>
  );
}

import { forwardRef } from "react";
import { Text, View } from "react-native";
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback } from "react";

import type { ItemCondition, AgeRange } from "@googoo/shared";

import { Button, ChipGroup } from "@/components/ui";
import { useSearchStore, type SearchFilters } from "@/stores/searchStore";

const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: "new_with_tags", label: "New with tags" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "newborn", label: "Newborn" },
  { value: "0_3mo", label: "0-3 mo" },
  { value: "3_6mo", label: "3-6 mo" },
  { value: "6_12mo", label: "6-12 mo" },
  { value: "1_2yr", label: "1-2 yr" },
  { value: "2_4yr", label: "2-4 yr" },
  { value: "4_6yr", label: "4-6 yr" },
];

const SORT_OPTIONS: { value: SearchFilters["sortBy"]; label: string }[] = [
  { value: "distance", label: "Distance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

interface FilterSheetProps {
  onApply: () => void;
}

export const FilterSheet = forwardRef<GorhomBottomSheet, FilterSheetProps>(
  ({ onApply }, ref) => {
    const { filters, setFilters, resetFilters } = useSearchStore();

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={["85%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#D9D6D2" }}
        backgroundStyle={{ backgroundColor: "#F7F5F3" }}
      >
        <View className="border-b border-neutral-200 px-4 pb-3">
          <Text className="text-lg font-semibold text-text">Filters</Text>
        </View>
        <BottomSheetScrollView className="px-4 pt-4">
          <View className="pb-8">
            {/* Condition */}
            <Text className="mb-2 text-sm font-semibold text-text">
              Condition
            </Text>
            <ChipGroup
              options={CONDITION_OPTIONS}
              selected={filters.conditions}
              onChange={(conditions) => setFilters({ conditions })}
            />

            {/* Age Range */}
            <Text className="mb-2 mt-6 text-sm font-semibold text-text">
              Age Range
            </Text>
            <ChipGroup
              options={AGE_OPTIONS}
              selected={filters.ageRanges}
              onChange={(ageRanges) => setFilters({ ageRanges })}
            />

            {/* Sort */}
            <Text className="mb-2 mt-6 text-sm font-semibold text-text">
              Sort by
            </Text>
            <ChipGroup
              options={SORT_OPTIONS}
              selected={[filters.sortBy]}
              onChange={(vals) => {
                if (vals.length > 0)
                  setFilters({ sortBy: vals[vals.length - 1] });
              }}
              multiple={false}
            />

            {/* Actions */}
            <View className="mt-8 flex-row gap-3">
              <View className="flex-1">
                <Button variant="ghost" fullWidth onPress={resetFilters}>
                  Reset
                </Button>
              </View>
              <View className="flex-1">
                <Button variant="primary" fullWidth onPress={onApply}>
                  Apply
                </Button>
              </View>
            </View>
          </View>
        </BottomSheetScrollView>
      </GorhomBottomSheet>
    );
  },
);

FilterSheet.displayName = "FilterSheet";

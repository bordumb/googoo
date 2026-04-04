import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Baby, ShoppingBag, Package } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import type { AgeRange } from "@googoo/shared";

import { Button, Input, ChipGroup } from "@/components/ui";
import { CategoryGrid } from "@/components/search/CategoryGrid";
import type { CategoryKey } from "@/constants/categories";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "newborn", label: "Newborn" },
  { value: "0_3mo", label: "0-3 mo" },
  { value: "3_6mo", label: "3-6 mo" },
  { value: "6_12mo", label: "6-12 mo" },
  { value: "1_2yr", label: "1-2 yr" },
  { value: "2_4yr", label: "2-4 yr" },
  { value: "4_6yr", label: "4-6 yr" },
];

interface PageData {
  key: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const PAGES: PageData[] = [
  {
    key: "location",
    icon: MapPin,
    title: "Where are you?",
    subtitle: "We'll show you items and parents nearby",
  },
  {
    key: "kids",
    icon: Baby,
    title: "How old are your little ones?",
    subtitle: "We'll personalize your feed",
  },
  {
    key: "interests",
    icon: ShoppingBag,
    title: "What are you looking for?",
    subtitle: "Pick categories that interest you",
  },
  {
    key: "listing",
    icon: Package,
    title: "Got something to list?",
    subtitle: "Your closet's treasure is another parent's find",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [neighborhood, setNeighborhood] = useState("");
  const [kidAges, setKidAges] = useState<AgeRange[]>([]);
  const [interests, setInterests] = useState<CategoryKey[]>([]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const goToPage = (page: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flatListRef.current?.scrollToOffset({ offset: page * SCREEN_WIDTH, animated: true });
  };

  const handleNext = () => {
    if (currentPage < PAGES.length - 1) {
      goToPage(currentPage + 1);
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const renderPage = ({ item }: { item: PageData }) => {
    const Icon = item.icon;

    return (
      <View style={{ width: SCREEN_WIDTH }} className="flex-1 px-6 pt-12">
        <View className="mb-6 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon size={32} color="#6B8F71" />
          </View>
          <Text className="text-center text-2xl font-bold text-text">
            {item.title}
          </Text>
          <Text className="mt-2 text-center text-sm text-neutral-400">
            {item.subtitle}
          </Text>
        </View>

        {item.key === "location" && (
          <View>
            <View className="mb-4 h-40 items-center justify-center rounded-card bg-neutral-100">
              <MapPin size={32} color="#8F8A84" />
              <Text className="mt-2 text-sm text-neutral-400">
                Map view coming soon
              </Text>
            </View>
            <Input
              label="Neighborhood"
              placeholder="e.g. North End, Tacoma"
              value={neighborhood}
              onChangeText={setNeighborhood}
              leftIcon={<MapPin size={16} color="#8F8A84" />}
            />
          </View>
        )}

        {item.key === "kids" && (
          <View>
            <ChipGroup
              options={AGE_OPTIONS}
              selected={kidAges}
              onChange={setKidAges}
              multiple
            />
            <Pressable
              onPress={handleNext}
              className="mt-4 items-center"
            >
              <Text className="text-sm text-neutral-400">
                No kids yet? Skip this step
              </Text>
            </Pressable>
          </View>
        )}

        {item.key === "interests" && (
          <CategoryGrid
            onSelect={(cat) => {
              if (interests.includes(cat)) {
                setInterests(interests.filter((c) => c !== cat));
              } else {
                setInterests([...interests, cat]);
              }
            }}
            selected={null}
          />
        )}

        {item.key === "listing" && (
          <View className="items-center gap-4">
            <Button
              variant="primary"
              fullWidth
              onPress={() => router.replace("/listing/create")}
            >
              List Your First Item
            </Button>
            <Pressable onPress={handleSkip}>
              <Text className="text-sm text-neutral-400">
                Skip for now
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.key}
        renderItem={renderPage}
      />

      {/* Bottom controls */}
      <View className="px-6 pb-12">
        {/* Dot indicators */}
        <View className="mb-4 flex-row justify-center gap-2">
          {PAGES.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${
                i === currentPage ? "w-6 bg-primary" : "w-2 bg-neutral-300"
              }`}
            />
          ))}
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button variant="ghost" fullWidth onPress={handleSkip}>
              Skip
            </Button>
          </View>
          <View className="flex-1">
            <Button variant="primary" fullWidth onPress={handleNext}>
              {currentPage === PAGES.length - 1 ? "Get Started" : "Next"}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

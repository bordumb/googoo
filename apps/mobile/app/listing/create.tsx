import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  X,
  DollarSign,
  ArrowLeftRight,
  Gift,
  Check,
  PartyPopper,
} from "lucide-react-native";

import { formatPrice } from "@googoo/shared";
import type { ItemCondition, AgeRange, ListingType } from "@googoo/shared";

import { Badge } from "@/components/common/Badge";
import { Button, Card, Input, TextArea, StickyBottomBar, ChipGroup } from "@/components/ui";
import { StepIndicator } from "@/components/listings/StepIndicator";
import { useCreateListing } from "@/hooks/useCreateListing";
import { CATEGORIES } from "@/constants/categories";
import { CONFIG } from "@/constants/config";

const STEPS = ["Photos", "Details", "Pricing", "Review"];

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

export default function CreateListingScreen() {
  const router = useRouter();
  const {
    step,
    draft,
    updateDraft,
    canAdvance,
    next,
    back,
    submit,
    reset,
    isSubmitting,
    isSuccess,
  } = useCreateListing();

  const pickImage = async () => {
    if (draft.images.length >= CONFIG.MAX_LISTING_IMAGES) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: CONFIG.IMAGE_QUALITY,
    });
    if (!result.canceled && result.assets[0]) {
      updateDraft({ images: [...draft.images, result.assets[0].uri] });
    }
  };

  const removeImage = (index: number) => {
    updateDraft({ images: draft.images.filter((_, i) => i !== index) });
  };

  if (isSuccess) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <PartyPopper size={40} color="#6B8F71" />
        </View>
        <Text className="text-2xl font-bold text-text">Your listing is live!</Text>
        <Text className="mt-2 text-center text-neutral-400">
          Other parents nearby can now see your listing.
        </Text>
        <View className="mt-8 w-full gap-3">
          <Button variant="primary" fullWidth onPress={() => router.back()}>
            View Listing
          </Button>
          <Button variant="ghost" fullWidth onPress={reset}>
            List Another Item
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StepIndicator steps={STEPS} currentStep={step} />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              Add photos ({draft.images.length}/{CONFIG.MAX_LISTING_IMAGES})
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {draft.images.map((uri, i) => (
                <View key={i} className="relative">
                  <Image
                    source={{ uri }}
                    className={`rounded-lg ${i === 0 ? "h-40 w-40" : "h-24 w-24"}`}
                  />
                  <Pressable
                    onPress={() => removeImage(i)}
                    className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-error"
                  >
                    <X size={12} color="#fff" />
                  </Pressable>
                  {i === 0 && (
                    <View className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5">
                      <Text className="text-xs text-white">Cover</Text>
                    </View>
                  )}
                </View>
              ))}
              {draft.images.length < CONFIG.MAX_LISTING_IMAGES && (
                <Pressable
                  onPress={pickImage}
                  className={`items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 ${
                    draft.images.length === 0 ? "h-40 w-40" : "h-24 w-24"
                  }`}
                >
                  <Camera size={24} color="#8F8A84" />
                  <Text className="mt-1 text-xs text-neutral-400">Add</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {step === 1 && (
          <View className="gap-4">
            <Input
              label="Title"
              placeholder="What are you listing?"
              value={draft.title}
              onChangeText={(title) => updateDraft({ title })}
              maxLength={100}
            />

            <View>
              <Text className="mb-2 text-sm font-medium text-text">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.key}
                    onPress={() => updateDraft({ category: cat.key })}
                    className={`rounded-full px-3 py-1.5 ${
                      draft.category === cat.key ? "bg-primary" : "bg-neutral-100"
                    }`}
                  >
                    <Text
                      className={`text-sm ${draft.category === cat.key ? "font-semibold text-white" : "text-text"}`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-text">Condition</Text>
              <View className="flex-row flex-wrap gap-2">
                {CONDITION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => updateDraft({ condition: opt.value })}
                    className={`rounded-card border px-4 py-3 ${
                      draft.condition === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        draft.condition === opt.value ? "text-primary" : "text-text"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-text">
                Age range (optional)
              </Text>
              <ChipGroup
                options={AGE_OPTIONS}
                selected={draft.ageRange ? [draft.ageRange] : []}
                onChange={(vals) => updateDraft({ ageRange: vals[0] ?? null })}
                multiple={false}
              />
            </View>

            <TextArea
              label="Description (optional)"
              placeholder="Describe the item..."
              value={draft.description}
              onChangeText={(description) => updateDraft({ description })}
              maxLength={2000}
              showCount
            />
          </View>
        )}

        {step === 2 && (
          <View className="gap-4">
            <Text className="text-base font-semibold text-text">
              How do you want to list this?
            </Text>
            <View className="gap-3">
              {(
                [
                  { type: "sell" as ListingType, icon: DollarSign, label: "Sell", desc: "Set a price" },
                  { type: "swap" as ListingType, icon: ArrowLeftRight, label: "Swap", desc: "Trade for something" },
                  { type: "free" as ListingType, icon: Gift, label: "Free", desc: "Give it away" },
                ] as const
              ).map(({ type, icon: Icon, label, desc }) => (
                <Pressable
                  key={type}
                  onPress={() => updateDraft({ listingType: type })}
                  className={`flex-row items-center rounded-card border p-4 ${
                    draft.listingType === type
                      ? "border-primary bg-primary/10"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      draft.listingType === type ? "bg-primary" : "bg-neutral-100"
                    }`}
                  >
                    <Icon
                      size={20}
                      color={draft.listingType === type ? "#fff" : "#8F8A84"}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-text">
                      {label}
                    </Text>
                    <Text className="text-sm text-neutral-400">{desc}</Text>
                  </View>
                  {draft.listingType === type && (
                    <Check size={20} color="#6B8F71" />
                  )}
                </Pressable>
              ))}
            </View>

            {draft.listingType === "sell" && (
              <Input
                label="Price"
                placeholder="0.00"
                keyboardType="numeric"
                leftIcon={<DollarSign size={16} color="#8F8A84" />}
                value={
                  draft.priceCents ? (draft.priceCents / 100).toString() : ""
                }
                onChangeText={(text) => {
                  const cents = Math.round(parseFloat(text || "0") * 100);
                  updateDraft({ priceCents: isNaN(cents) ? null : cents });
                }}
              />
            )}

            {draft.listingType === "swap" && (
              <TextArea
                label="What do you want in return?"
                placeholder="Describe what you're looking for..."
                value={draft.swapPreferences}
                onChangeText={(swapPreferences) =>
                  updateDraft({ swapPreferences })
                }
                maxLength={500}
                showCount
              />
            )}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="mb-4 text-base font-semibold text-text">
              Review your listing
            </Text>
            <Card className="overflow-hidden">
              {draft.images[0] && (
                <Image
                  source={{ uri: draft.images[0] }}
                  className="h-48 w-full"
                  resizeMode="cover"
                />
              )}
              <View className="p-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg font-bold text-text">
                    {draft.listingType === "sell"
                      ? formatPrice(draft.priceCents)
                      : draft.listingType === "swap"
                        ? "Swap"
                        : "Free"}
                  </Text>
                  {draft.condition && (
                    <Badge
                      label={
                        CONDITION_OPTIONS.find((o) => o.value === draft.condition)
                          ?.label ?? ""
                      }
                      variant="neutral"
                    />
                  )}
                </View>
                <Text className="mt-1 text-base font-semibold text-text">
                  {draft.title}
                </Text>
                {draft.description && (
                  <Text
                    className="mt-1 text-sm text-neutral-400"
                    numberOfLines={2}
                  >
                    {draft.description}
                  </Text>
                )}
              </View>
            </Card>

            <View className="mt-4 gap-2">
              <ReviewRow
                label="Category"
                value={
                  CATEGORIES.find((c) => c.key === draft.category)?.label ?? ""
                }
              />
              <ReviewRow
                label="Photos"
                value={`${draft.images.length} photo${draft.images.length !== 1 ? "s" : ""}`}
              />
              {draft.listingType === "swap" && draft.swapPreferences && (
                <ReviewRow
                  label="Looking for"
                  value={draft.swapPreferences}
                />
              )}
            </View>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      <StickyBottomBar className="flex-row gap-3">
        {step > 0 && (
          <View className="flex-1">
            <Button variant="ghost" fullWidth onPress={back}>
              Back
            </Button>
          </View>
        )}
        <View className="flex-1">
          {step < 3 ? (
            <Button
              variant="primary"
              fullWidth
              disabled={!canAdvance()}
              onPress={next}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="accent"
              fullWidth
              loading={isSubmitting}
              onPress={submit}
            >
              Post Listing
            </Button>
          )}
        </View>
      </StickyBottomBar>
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-sm text-neutral-400">{label}</Text>
      <Text className="text-sm font-medium text-text">{value}</Text>
    </View>
  );
}

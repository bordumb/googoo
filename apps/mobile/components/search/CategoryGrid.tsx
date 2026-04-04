import { Pressable, Text, View } from "react-native";
import {
  Shirt,
  Baby,
  Blocks,
  Lamp,
  CupSoda,
  Bath,
  Heart,
  Package,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { CATEGORIES, type CategoryKey } from "@/constants/categories";

const ICON_MAP: Record<string, LucideIcon> = {
  shirt: Shirt,
  baby: Baby,
  blocks: Blocks,
  lamp: Lamp,
  "cup-soda": CupSoda,
  bath: Bath,
  heart: Heart,
  package: Package,
};

interface CategoryGridProps {
  onSelect: (category: CategoryKey) => void;
  selected?: CategoryKey | null;
}

export function CategoryGrid({ onSelect, selected }: CategoryGridProps) {
  return (
    <View className="flex-row flex-wrap">
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] ?? Package;
        const isSelected = selected === cat.key;
        return (
          <View key={cat.key} className="w-1/4 items-center p-2">
            <Pressable
              onPress={() => onSelect(cat.key)}
              className={`h-16 w-16 items-center justify-center rounded-2xl ${
                isSelected ? "bg-primary" : "bg-white shadow-sm"
              }`}
            >
              <Icon size={24} color={isSelected ? "#fff" : "#6B8F71"} />
            </Pressable>
            <Text
              className={`mt-1 text-center text-xs ${isSelected ? "font-semibold text-primary" : "text-neutral-500"}`}
            >
              {cat.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

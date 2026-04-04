import { View } from "react-native";

import { Chip } from "./Chip";

interface ChipGroupProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
  multiple?: boolean;
}

export function ChipGroup<T extends string>({
  options,
  selected,
  onChange,
  multiple = true,
}: ChipGroupProps<T>) {
  const handlePress = (value: T) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter((s) => s !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          selected={selected.includes(opt.value)}
          onPress={() => handlePress(opt.value)}
        />
      ))}
    </View>
  );
}

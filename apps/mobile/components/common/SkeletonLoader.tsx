import { type DimensionValue, View } from "react-native";

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  rounded?: boolean;
}

export function SkeletonLoader({ width = "100%", height = 20, rounded = false }: SkeletonLoaderProps) {
  return (
    <View
      className={`bg-neutral-200 ${rounded ? "rounded-full" : "rounded-md"}`}
      style={{ width, height }}
    />
  );
}

import { Text, View } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "primary" | "accent" | "neutral";
}

export function Badge({ label, variant = "primary" }: BadgeProps) {
  const bgClass = {
    primary: "bg-primary",
    accent: "bg-accent",
    neutral: "bg-neutral-200",
  }[variant];

  return (
    <View className={`rounded-full px-2 py-1 ${bgClass}`}>
      <Text className="text-xs text-white">{label}</Text>
    </View>
  );
}

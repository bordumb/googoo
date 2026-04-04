import { Text, View } from "react-native";

interface Stat {
  value: number;
  label: string;
}

interface StatsRowProps {
  stats: Stat[];
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <View className="flex-row rounded-card bg-white p-4 shadow-sm">
      {stats.map((stat, i) => (
        <View
          key={stat.label}
          className={`flex-1 items-center ${
            i < stats.length - 1 ? "border-r border-neutral-100" : ""
          }`}
        >
          <Text className="text-xl font-bold text-text">{stat.value}</Text>
          <Text className="mt-0.5 text-xs text-neutral-400">{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

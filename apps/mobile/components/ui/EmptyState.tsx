import { type ElementType } from "react";
import { Text, View } from "react-native";
import type { LucideProps } from "lucide-react-native";

import { Button } from "./Button";

interface EmptyStateProps {
  icon: ElementType<LucideProps>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center px-8 ${className}`}>
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Icon size={28} color="#6B8F71" />
      </View>

      <Text className="text-center text-lg font-semibold text-neutral-800">
        {title}
      </Text>

      {description && (
        <Text className="mt-2 text-center text-sm text-neutral-400">
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <View className="mt-6">
          <Button variant="primary" size="md" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
}

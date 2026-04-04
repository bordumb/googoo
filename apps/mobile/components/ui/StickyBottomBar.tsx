import { type ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StickyBottomBarProps {
  children: ReactNode;
  className?: string;
}

export function StickyBottomBar({ children, className = "" }: StickyBottomBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      className={`border-t border-neutral-200 bg-white px-4 pt-3 ${className}`}
      style={{ paddingBottom: Math.max(bottom, 16) }}
    >
      {children}
    </View>
  );
}

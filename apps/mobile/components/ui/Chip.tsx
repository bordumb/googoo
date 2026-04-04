import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import { X } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
}

export function Chip({
  label,
  selected = false,
  onPress,
  onDismiss,
}: ChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.1, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const bgClass = selected ? "bg-primary" : "bg-neutral-100";
  const textClass = selected ? "text-white" : "text-text";

  return (
    <AnimatedPressable
      onPress={handlePress}
      className={`flex-row items-center rounded-full px-3 py-1.5 ${bgClass}`}
      style={animatedStyle}
    >
      <Text className={`text-sm font-medium ${textClass}`}>{label}</Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} className="ml-1">
          <X size={14} color={selected ? "#fff" : "#6B665F"} />
        </Pressable>
      )}
    </AnimatedPressable>
  );
}

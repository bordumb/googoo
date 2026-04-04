import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View className="px-4 py-3">
      <View className="flex-row items-center justify-center gap-2">
        {steps.map((_, i) => (
          <StepDot key={i} active={i <= currentStep} current={i === currentStep} />
        ))}
      </View>
      <Text className="mt-2 text-center text-sm font-medium text-neutral-500">
        Step {currentStep + 1}: {steps[currentStep]}
      </Text>
    </View>
  );
}

function StepDot({ active, current }: { active: boolean; current: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(current ? 24 : 8, { damping: 15 }),
    backgroundColor: active ? "#6B8F71" : "#D9D6D2",
  }));

  return <Animated.View className="h-2 rounded-full" style={animatedStyle} />;
}

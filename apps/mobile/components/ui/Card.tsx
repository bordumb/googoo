import { type ReactNode } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = { damping: 15, stiffness: 300 } as const;

interface CardBaseProps {
  children: ReactNode;
  className?: string;
}

interface StaticCardProps extends CardBaseProps {
  pressable?: false;
  onPress?: never;
}

interface PressableCardProps extends CardBaseProps {
  pressable: true;
  onPress: () => void;
}

type CardProps = StaticCardProps | PressableCardProps;

export function Card({ children, className = "", ...rest }: CardProps) {
  if (rest.pressable) {
    return (
      <PressableCardInner className={className} onPress={rest.onPress}>
        {children}
      </PressableCardInner>
    );
  }

  return (
    <View className={`rounded-card bg-white shadow-sm ${className}`}>
      {children}
    </View>
  );
}

function PressableCardInner({
  children,
  className,
  onPress,
}: {
  children: ReactNode;
  className: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`rounded-card bg-white shadow-sm ${className}`}
    >
      {children}
    </AnimatedPressable>
  );
}

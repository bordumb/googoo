import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ImageCarouselProps {
  images: string[];
  height?: number;
}

export function ImageCarousel({ images, height = 300 }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width: SCREEN_WIDTH, height }}
            resizeMode="cover"
          />
        )}
      />
      {images.length > 1 && (
        <View className="absolute bottom-3 flex-row justify-center self-center">
          {images.map((_, i) => (
            <DotIndicator key={i} active={i === activeIndex} />
          ))}
        </View>
      )}
    </View>
  );
}

function DotIndicator({ active }: { active: boolean }) {
  const scale = useSharedValue(active ? 1.2 : 1);
  scale.value = withSpring(active ? 1.2 : 1, { damping: 15 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: active ? "#6B8F71" : "#D9D6D2",
  }));

  return (
    <Animated.View
      className="mx-1 h-2 w-2 rounded-full"
      style={animatedStyle}
    />
  );
}

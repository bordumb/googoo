import { Image, View } from "react-native";

interface AvatarProps {
  uri: string | null;
  size?: number;
}

export function Avatar({ uri, size = 40 }: AvatarProps) {
  return (
    <View
      className="overflow-hidden rounded-full bg-neutral-200"
      style={{ width: size, height: size }}
    >
      {uri && <Image source={{ uri }} style={{ width: size, height: size }} />}
    </View>
  );
}

import { Tabs } from "expo-router";
import { Home, Search, Users } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6B8F71",
        tabBarInactiveTintColor: "#8F8A84",
        tabBarStyle: {
          backgroundColor: "#F7F5F3",
          borderTopColor: "#EDEBE8",
        },
        headerStyle: {
          backgroundColor: "#F7F5F3",
        },
        headerTintColor: "#2D2D2D",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

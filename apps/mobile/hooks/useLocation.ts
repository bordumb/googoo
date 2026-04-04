import { useEffect } from "react";
import * as Location from "expo-location";

import { IS_MOCK } from "@/services/provider";
import { useLocationStore } from "@/stores/locationStore";

export function useLocation() {
  const { setCoords } = useLocationStore();

  useEffect(() => {
    if (IS_MOCK) {
      // Mock mode: coords are pre-seeded by ServiceProvider
      return;
    }

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      setCoords(location.coords.latitude, location.coords.longitude);
    })();
  }, [setCoords]);
}

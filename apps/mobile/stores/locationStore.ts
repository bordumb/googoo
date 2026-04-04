import { create } from "zustand";

interface LocationState {
  lat: number;
  lng: number;
  radiusMeters: number;
  setCoords: (lat: number, lng: number) => void;
  setRadius: (radiusMeters: number) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: 0,
  lng: 0,
  radiusMeters: 16093, // 10 miles in meters
  setCoords: (lat, lng) => set({ lat, lng }),
  setRadius: (radiusMeters) => set({ radiusMeters }),
}));

import { create } from "zustand";

import type { ItemCondition, AgeRange } from "@googoo/shared";

export interface SearchFilters {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  conditions: ItemCondition[];
  ageRanges: AgeRange[];
  maxDistance: number;
  includeShipping: boolean;
  sortBy: "distance" | "price_asc" | "price_desc" | "newest";
}

const DEFAULT_FILTERS: SearchFilters = {
  category: null,
  minPrice: null,
  maxPrice: null,
  conditions: [],
  ageRanges: [],
  maxDistance: 16093,
  includeShipping: false,
  sortBy: "distance",
};

interface SearchState {
  query: string;
  filters: SearchFilters;
  recentSearches: string[];
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  activeFilterCount: () => number;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  filters: DEFAULT_FILTERS,
  recentSearches: ["stroller", "cloth diapers", "size 3T"],
  setQuery: (query) => set({ query }),
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  addRecentSearch: (query) =>
    set((state) => ({
      recentSearches: [
        query,
        ...state.recentSearches.filter((s) => s !== query),
      ].slice(0, 10),
    })),
  removeRecentSearch: (query) =>
    set((state) => ({
      recentSearches: state.recentSearches.filter((s) => s !== query),
    })),
  activeFilterCount: () => {
    const f = get().filters;
    let count = 0;
    if (f.category) count++;
    if (f.minPrice !== null || f.maxPrice !== null) count++;
    if (f.conditions.length > 0) count++;
    if (f.ageRanges.length > 0) count++;
    if (f.maxDistance !== 16093) count++;
    if (f.includeShipping) count++;
    if (f.sortBy !== "distance") count++;
    return count;
  },
}));

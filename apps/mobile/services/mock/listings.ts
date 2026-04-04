import type { NearbyListing, SearchResult } from "@googoo/shared";

import { MOCK_LISTINGS } from "@/fixtures";

import type { ListingService, NearbyListingsParams, SearchListingsParams } from "../types";

export const mockListingService: ListingService = {
  async fetchNearby(params: NearbyListingsParams): Promise<NearbyListing[]> {
    return MOCK_LISTINGS.slice(params.offset, params.offset + params.limit);
  },

  async fetchById(id: string): Promise<NearbyListing | null> {
    return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
  },

  async search(params: SearchListingsParams): Promise<SearchResult[]> {
    const query = params.query.toLowerCase();
    return MOCK_LISTINGS.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        (l.description?.toLowerCase().includes(query) ?? false),
    )
      .slice(params.offset, params.offset + params.limit)
      .map((l) => ({ ...l, rank: 1.0 }));
  },
};

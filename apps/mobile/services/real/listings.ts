import type { NearbyListing, SearchResult } from "@googoo/shared";

import { getSupabase } from "../supabase";
import type { ListingService, NearbyListingsParams, SearchListingsParams } from "../types";

export const realListingService: ListingService = {
  async fetchNearby(params: NearbyListingsParams): Promise<NearbyListing[]> {
    const { data, error } = await getSupabase().rpc("nearby_listings", {
      user_lat: params.lat,
      user_lng: params.lng,
      radius_m: params.radiusMeters,
      limit_n: params.limit,
      offset_n: params.offset,
    });
    if (error) throw error;
    return (data ?? []) as NearbyListing[];
  },

  async fetchById(id: string): Promise<NearbyListing | null> {
    const { data, error } = await getSupabase()
      .from("listings")
      .select("*, profiles!seller_id(display_name, avatar_url)")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as NearbyListing | null;
  },

  async search(params: SearchListingsParams): Promise<SearchResult[]> {
    const { data, error } = await getSupabase().rpc("search_listings", {
      search_query: params.query,
      user_lat: params.lat,
      user_lng: params.lng,
      radius_m: params.radiusMeters,
      limit_n: params.limit,
      offset_n: params.offset,
    });
    if (error) throw error;
    return (data ?? []) as SearchResult[];
  },
};

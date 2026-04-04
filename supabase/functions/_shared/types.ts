/**
 * Vendored domain types from @googoo/shared.
 * Deno runtime cannot follow pnpm workspace symlinks,
 * so essential types are duplicated here.
 *
 * Keep in sync with packages/shared/src/types.ts.
 */

export type ListingStatus = "active" | "reserved" | "sold" | "swapped" | "removed";
export type ListingType = "sell" | "swap" | "free";
export type ItemCondition = "new_with_tags" | "like_new" | "good" | "fair";
export type AgeRange = "newborn" | "0_3mo" | "3_6mo" | "6_12mo" | "1_2yr" | "2_4yr" | "4_6yr";
export type TransactionStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  neighborhood: string | null;
  kid_ages: string[];
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  category: string;
  condition: ItemCondition;
  age_range: AgeRange | null;
  listing_type: ListingType;
  price_cents: number | null;
  swap_preferences: string | null;
  images: string[];
  ships: boolean;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

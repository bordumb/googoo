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

export interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  type: ListingType;
  price_cents: number | null;
  fee_cents: number | null;
  stripe_payment_intent_id: string | null;
  shipping_label_url: string | null;
  tracking_number: string | null;
  status: TransactionStatus;
  created_at: string;
  completed_at: string | null;
}

export interface Review {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: boolean;
  comment: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  listing_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  radius_miles: number | null;
  is_geographic: boolean;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface Post {
  id: string;
  group_id: string;
  author_id: string;
  content: string;
  images: string[] | null;
  parent_id: string | null;
  created_at: string;
}

export interface GoogooEvent {
  id: string;
  group_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  address: string;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  query: string | null;
  filters: Record<string, unknown>;
  notify: boolean;
  created_at: string;
}

/** Listing enriched with distance and seller info (matches nearby_listings RPC). */
export interface NearbyListing extends Listing {
  distance_m: number;
  seller_display_name: string;
  seller_avatar_url: string | null;
}

/** Listing enriched with search rank and distance (matches search_listings RPC). */
export interface SearchResult extends Listing {
  distance_m: number;
  rank: number;
}

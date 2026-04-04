import { z } from "zod";

export const listingStatusSchema = z.enum([
  "active",
  "reserved",
  "sold",
  "swapped",
  "removed",
]);

export const listingTypeSchema = z.enum(["sell", "swap", "free"]);

export const itemConditionSchema = z.enum(["new_with_tags", "like_new", "good", "fair"]);

export const ageRangeSchema = z.enum([
  "newborn",
  "0_3mo",
  "3_6mo",
  "6_12mo",
  "1_2yr",
  "2_4yr",
  "4_6yr",
]);

export const transactionStatusSchema = z.enum([
  "pending",
  "paid",
  "shipped",
  "completed",
  "cancelled",
]);

/** Schema for creating a new listing (client-side form validation + server-side). */
export const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  condition: itemConditionSchema,
  age_range: ageRangeSchema.optional(),
  listing_type: listingTypeSchema,
  price_cents: z.number().int().nonnegative().optional(),
  swap_preferences: z.string().max(500).optional(),
  images: z.array(z.string()).min(1).max(5),
  ships: z.boolean().default(false),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

import { faker } from "@faker-js/faker";

import type {
  Group,
  Message,
  NearbyListing,
  Post,
  Profile,
  SearchResult,
} from "@googoo/shared";

import { CATEGORIES } from "@/constants/categories";

import { avatarImage, listingImage } from "./images";

// Seed for deterministic output across sessions
faker.seed(42);

const LISTING_TYPES = ["sell", "swap", "free"] as const;
const CONDITIONS = ["new_with_tags", "like_new", "good", "fair"] as const;
const AGE_RANGES = ["newborn", "0_3mo", "3_6mo", "6_12mo", "1_2yr", "2_4yr", "4_6yr"] as const;
const KID_AGES = ["3mo", "6mo", "9mo", "1yr", "18mo", "2yr", "3yr", "4yr", "5yr"];
const NEIGHBORHOODS = ["North End", "Stadium District", "6th Avenue", "Proctor", "Old Town", "Lincoln", "South Tacoma", "Hilltop"];

export function createProfile(overrides?: Partial<Profile>): Profile {
  const id = faker.string.uuid();
  return {
    id,
    display_name: faker.person.firstName() + " " + faker.person.lastName().charAt(0) + ".",
    avatar_url: avatarImage(id),
    bio: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }) ?? null,
    neighborhood: faker.helpers.arrayElement(NEIGHBORHOODS),
    kid_ages: faker.helpers.arrayElements(KID_AGES, { min: 1, max: 3 }),
    push_token: null,
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 30 }).toISOString(),
    ...overrides,
  };
}

export function createListing(
  sellerId: string,
  sellerName: string,
  sellerAvatar: string | null,
  overrides?: Partial<NearbyListing>,
): NearbyListing {
  const id = faker.string.uuid();
  const listingType = faker.helpers.arrayElement(LISTING_TYPES);
  const category = faker.helpers.arrayElement(CATEGORIES).key;
  const imageCount = faker.number.int({ min: 1, max: 4 });

  return {
    id,
    seller_id: sellerId,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    category,
    condition: faker.helpers.arrayElement(CONDITIONS),
    age_range: faker.helpers.arrayElement(AGE_RANGES),
    listing_type: listingType,
    price_cents: listingType === "sell" ? faker.number.int({ min: 200, max: 15000 }) : null,
    swap_preferences: listingType === "swap" ? faker.lorem.sentence() : null,
    images: Array.from({ length: imageCount }, (_, i) => listingImage(id, i)),
    ships: faker.datatype.boolean({ probability: 0.2 }),
    status: "active",
    created_at: faker.date.recent({ days: 14 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString(),
    distance_m: faker.number.float({ min: 300, max: 15000, multipleOf: 100 }),
    seller_display_name: sellerName,
    seller_avatar_url: sellerAvatar,
    ...overrides,
  };
}

export function createSearchResult(
  sellerId: string,
  overrides?: Partial<SearchResult>,
): SearchResult {
  const id = faker.string.uuid();
  const category = faker.helpers.arrayElement(CATEGORIES).key;

  return {
    id,
    seller_id: sellerId,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    category,
    condition: faker.helpers.arrayElement(CONDITIONS),
    age_range: faker.helpers.arrayElement(AGE_RANGES),
    listing_type: "sell",
    price_cents: faker.number.int({ min: 200, max: 15000 }),
    swap_preferences: null,
    images: [listingImage(id, 0)],
    ships: false,
    status: "active",
    created_at: faker.date.recent({ days: 14 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString(),
    distance_m: faker.number.float({ min: 300, max: 15000, multipleOf: 100 }),
    rank: faker.number.float({ min: 0.1, max: 1.0, multipleOf: 0.01 }),
    ...overrides,
  };
}

export function createGroup(overrides?: Partial<Group>): Group {
  return {
    id: faker.string.uuid(),
    name: faker.location.city() + " Parents",
    description: faker.lorem.sentence(),
    radius_miles: faker.number.int({ min: 5, max: 25 }),
    is_geographic: true,
    created_at: faker.date.past({ years: 1 }).toISOString(),
    ...overrides,
  };
}

export function createPost(groupId: string, authorId: string, overrides?: Partial<Post>): Post {
  return {
    id: faker.string.uuid(),
    group_id: groupId,
    author_id: authorId,
    content: faker.lorem.paragraph(),
    images: faker.helpers.maybe(() => [listingImage(faker.string.uuid(), 0)], { probability: 0.3 }) ?? null,
    parent_id: null,
    created_at: faker.date.recent({ days: 7 }).toISOString(),
    ...overrides,
  };
}

export function createMessage(
  threadId: string,
  senderId: string,
  overrides?: Partial<Message>,
): Message {
  return {
    id: faker.string.uuid(),
    thread_id: threadId,
    sender_id: senderId,
    content: faker.lorem.sentence(),
    listing_id: null,
    read_at: faker.helpers.maybe(() => faker.date.recent({ days: 1 }).toISOString(), { probability: 0.7 }) ?? null,
    created_at: faker.date.recent({ days: 3 }).toISOString(),
    ...overrides,
  };
}

// --- Thread (inbox row) ---

export interface Thread {
  id: string;
  otherUser: { id: string; display_name: string; avatar_url: string | null };
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  listingId: string | null;
  listingTitle: string | null;
  listingImage: string | null;
}

export function createThread(overrides?: Partial<Thread>): Thread {
  return {
    id: faker.string.uuid(),
    otherUser: {
      id: faker.string.uuid(),
      display_name: faker.person.firstName() + " " + faker.person.lastName().charAt(0) + ".",
      avatar_url: avatarImage(faker.string.uuid()),
    },
    lastMessage: faker.lorem.sentence(),
    lastMessageAt: faker.date.recent({ days: 3 }).toISOString(),
    unread: faker.datatype.boolean(),
    listingId: faker.string.uuid(),
    listingTitle: faker.commerce.productName(),
    listingImage: listingImage(faker.string.uuid(), 0),
    ...overrides,
  };
}

// --- Review ---

export interface MockReview {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  reviewee_id: string;
  rating: boolean;
  comment: string | null;
  created_at: string;
}

export function createReview(overrides?: Partial<MockReview>): MockReview {
  return {
    id: faker.string.uuid(),
    transaction_id: faker.string.uuid(),
    reviewer_id: faker.string.uuid(),
    reviewer_name: faker.person.firstName() + " " + faker.person.lastName().charAt(0) + ".",
    reviewer_avatar: avatarImage(faker.string.uuid()),
    reviewee_id: faker.string.uuid(),
    rating: faker.datatype.boolean({ probability: 0.85 }),
    comment: faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.sentence() : null,
    created_at: faker.date.recent({ days: 30 }).toISOString(),
    ...overrides,
  };
}

// --- Event ---

export interface MockEvent {
  id: string;
  group_id: string;
  group_name: string;
  creator_id: string;
  title: string;
  description: string | null;
  address: string;
  starts_at: string;
  ends_at: string | null;
  attendee_count: number;
  attendee_avatars: string[];
  created_at: string;
}

export function createEvent(overrides?: Partial<MockEvent>): MockEvent {
  return {
    id: faker.string.uuid(),
    group_id: faker.string.uuid(),
    group_name: faker.lorem.words(2),
    creator_id: faker.string.uuid(),
    title: faker.lorem.words(4),
    description: faker.lorem.sentence(),
    address: faker.location.streetAddress(),
    starts_at: faker.date.soon({ days: 14 }).toISOString(),
    ends_at: null,
    attendee_count: faker.number.int({ min: 3, max: 25 }),
    attendee_avatars: Array.from({ length: 4 }, () => avatarImage(faker.string.uuid())),
    created_at: faker.date.recent({ days: 7 }).toISOString(),
    ...overrides,
  };
}

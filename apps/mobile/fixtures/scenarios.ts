import type { Group, Message, NearbyListing, Post, Profile } from "@googoo/shared";

import {
  createGroup,
  createListing,
  createMessage,
  createPost,
  createProfile,
  createThread,
  createReview,
  createEvent,
  type Thread,
  type MockReview,
  type MockEvent,
} from "./factories";

// --- Profiles ---
export const MOCK_CURRENT_USER: Profile = createProfile({
  id: "00000000-0000-0000-0000-000000000001",
  display_name: "Alex T.",
  neighborhood: "North End",
  kid_ages: ["8mo", "3yr"],
});

const profileList: Profile[] = [
  MOCK_CURRENT_USER,
  ...Array.from({ length: 9 }, () => createProfile()),
];

export const MOCK_PROFILES: Profile[] = profileList;

// --- Listings (each linked to a random seller) ---
export const MOCK_LISTINGS: NearbyListing[] = Array.from({ length: 20 }, () => {
  const seller = profileList[Math.floor(Math.random() * profileList.length)]!;
  return createListing(seller.id, seller.display_name, seller.avatar_url);
});

// --- Groups ---
export const MOCK_GROUPS: Group[] = [
  createGroup({ name: "Tacoma Parents", description: "The main hub for parents in Tacoma", is_geographic: true }),
  createGroup({ name: "South Sound Families", description: "Families across the South Sound area", is_geographic: true }),
  createGroup({ name: "Stadium District Moms & Dads", description: "Hyper-local group for Stadium District", is_geographic: true }),
  createGroup({ name: "Cloth Diapering", description: "Tips, tricks, and deals on cloth diapers", is_geographic: false }),
  createGroup({ name: "Montessori at Home", description: "Montessori-inspired activities and materials", is_geographic: false }),
];

// --- Posts (spread across groups) ---
export const MOCK_POSTS: Post[] = MOCK_GROUPS.flatMap((group) =>
  Array.from({ length: 3 }, () => {
    const author = profileList[Math.floor(Math.random() * profileList.length)]!;
    return createPost(group.id, author.id);
  }),
);

// --- Messages (3 threads) ---
const thread1Id = "thread-001";
const thread2Id = "thread-002";
const thread3Id = "thread-003";

function generateThread(threadId: string, otherUser: Profile, count: number): Message[] {
  const users = [MOCK_CURRENT_USER.id, otherUser.id];
  return Array.from({ length: count }, (_, i) =>
    createMessage(threadId, users[i % 2]!, {
      created_at: new Date(Date.now() - (count - i) * 60000).toISOString(),
    }),
  );
}

export const MOCK_MESSAGES: Message[] = [
  ...generateThread(thread1Id, profileList[1]!, 6),
  ...generateThread(thread2Id, profileList[2]!, 8),
  ...generateThread(thread3Id, profileList[3]!, 5),
];

// --- Threads (inbox) ---
export const MOCK_THREADS: Thread[] = [
  createThread({
    id: thread1Id,
    otherUser: {
      id: profileList[1]!.id,
      display_name: profileList[1]!.display_name,
      avatar_url: profileList[1]!.avatar_url,
    },
    lastMessage: "Hey, is the stroller still available?",
    unread: true,
    listingTitle: MOCK_LISTINGS[0]?.title ?? "Baby Stroller",
    listingImage: MOCK_LISTINGS[0]?.images[0] ?? null,
    listingId: MOCK_LISTINGS[0]?.id ?? null,
  }),
  createThread({
    id: thread2Id,
    otherUser: {
      id: profileList[2]!.id,
      display_name: profileList[2]!.display_name,
      avatar_url: profileList[2]!.avatar_url,
    },
    lastMessage: "Perfect, see you at the park Saturday!",
    unread: false,
    listingTitle: MOCK_LISTINGS[3]?.title ?? "Baby Clothes",
    listingImage: MOCK_LISTINGS[3]?.images[0] ?? null,
    listingId: MOCK_LISTINGS[3]?.id ?? null,
  }),
  createThread({
    id: thread3Id,
    otherUser: {
      id: profileList[3]!.id,
      display_name: profileList[3]!.display_name,
      avatar_url: profileList[3]!.avatar_url,
    },
    lastMessage: "Thanks for the trade! My kid loves the blocks.",
    unread: false,
    listingId: null,
    listingTitle: null,
    listingImage: null,
  }),
  ...Array.from({ length: 5 }, () => createThread()),
];

// --- Reviews ---
export const MOCK_REVIEWS: MockReview[] = profileList.slice(1, 6).map((profile) =>
  createReview({
    reviewer_id: profile.id,
    reviewer_name: profile.display_name,
    reviewer_avatar: profile.avatar_url,
    reviewee_id: MOCK_CURRENT_USER.id,
  }),
);

// --- Events ---
export const MOCK_EVENTS: MockEvent[] = MOCK_GROUPS.slice(0, 3).map((group, i) =>
  createEvent({
    group_id: group.id,
    group_name: group.name,
    creator_id: profileList[i % profileList.length]?.id ?? MOCK_CURRENT_USER.id,
  }),
);

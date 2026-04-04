import type {
  Group,
  Message,
  NearbyListing,
  Post,
  Profile,
  SearchResult,
} from "@googoo/shared";

import type { Thread, MockReview, MockEvent } from "@/fixtures/factories";

export interface NearbyListingsParams {
  lat: number;
  lng: number;
  radiusMeters: number;
  limit: number;
  offset: number;
}

export interface SearchListingsParams {
  query: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  limit: number;
  offset: number;
}

export interface ListingService {
  fetchNearby(params: NearbyListingsParams): Promise<NearbyListing[]>;
  fetchById(id: string): Promise<NearbyListing | null>;
  search(params: SearchListingsParams): Promise<SearchResult[]>;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<{ user: { id: string } } | null>;
  signUp(email: string, password: string): Promise<{ user: { id: string } } | null>;
  signOut(): Promise<void>;
  getSession(): Promise<{ user: { id: string } } | null>;
}

export interface MessageService {
  fetchThreads(): Promise<Thread[]>;
  fetchThread(threadId: string): Promise<Message[]>;
  send(threadId: string, content: string): Promise<Message>;
}

export interface GroupService {
  fetchNearby(lat: number, lng: number): Promise<Group[]>;
  fetchPosts(groupId: string): Promise<Post[]>;
  fetchById(id: string): Promise<Group | null>;
}

export interface ReviewService {
  fetchForUser(userId: string): Promise<MockReview[]>;
}

export interface EventService {
  fetchForGroup(groupId: string): Promise<MockEvent[]>;
  fetchUpcoming(): Promise<MockEvent[]>;
}

export interface StorageService {
  uploadImage(uri: string, bucket: string): Promise<string | null>;
}

export interface Services {
  listings: ListingService;
  auth: AuthService;
  messages: MessageService;
  groups: GroupService;
  storage: StorageService;
  reviews: ReviewService;
  events: EventService;
}

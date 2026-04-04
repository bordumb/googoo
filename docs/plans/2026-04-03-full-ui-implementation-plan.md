# GooGoo Full UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all 7 user journeys with pixel-perfect polish, @rn-primitives components, Reanimated animations, haptics, and mock data — so the app feels real and complete.

**Architecture:** Each task builds the design components it needs alongside the screen that uses them. Mock data flows through the existing service layer (`useServices()` → mock services → fixtures). Zustand stores handle client state. React Query handles server state. NativeWind styles everything using `@googoo/ui` tokens.

**Tech Stack:** Expo SDK 52, expo-router v4, NativeWind v4, @rn-primitives/*, react-native-reanimated, @gorhom/bottom-sheet, expo-haptics, react-hook-form + zod, @tanstack/react-query v5, zustand v5.

**Existing patterns to follow (from codebase analysis):**
- Services: `useServices()` hook from `services/provider.tsx` — never import Supabase directly
- Mock detection: `IS_MOCK = __DEV__ && process.env.EXPO_PUBLIC_USE_MOCKS === "true"`
- Fixtures: factories in `fixtures/factories.ts`, scenarios in `fixtures/scenarios.ts`, seeded faker(42)
- Hooks: wrap `useQuery`/`useMutation` in custom hooks, enabled flag tied to location store
- Styling: NativeWind classes only, colors via tailwind.config.js theme, `rounded-card` = 12px
- Imports: `@/` alias for apps/mobile root, `@googoo/shared` for types, `@googoo/ui` for tokens

**Design doc:** `docs/plans/2026-04-03-full-ui-implementation-design.md`

---

## Task 1: Install Dependencies + Core Design Components

**Files:**
- Modify: `apps/mobile/package.json`
- Create: `apps/mobile/components/ui/Button.tsx`
- Create: `apps/mobile/components/ui/Card.tsx`
- Create: `apps/mobile/components/ui/Input.tsx`
- Create: `apps/mobile/components/ui/TextArea.tsx`
- Create: `apps/mobile/components/ui/Skeleton.tsx`
- Create: `apps/mobile/components/ui/EmptyState.tsx`
- Create: `apps/mobile/components/ui/StickyBottomBar.tsx`
- Create: `apps/mobile/components/ui/index.ts`

**Step 1: Install @rn-primitives and expo-haptics**

```bash
cd apps/mobile
pnpm add @rn-primitives/avatar @rn-primitives/select @rn-primitives/tabs \
  @rn-primitives/accordion @rn-primitives/alert-dialog @rn-primitives/dialog \
  @rn-primitives/popover @rn-primitives/separator @rn-primitives/toggle \
  @rn-primitives/toggle-group @rn-primitives/progress @rn-primitives/tooltip \
  @rn-primitives/types @rn-primitives/slot \
  expo-haptics
```

**Step 2: Create `components/ui/Button.tsx`**

```tsx
import * as Haptics from "expo-haptics";
import { forwardRef } from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANTS = {
  primary: {
    container: "bg-primary rounded-button px-6 py-3",
    text: "text-white font-semibold text-base",
    pressed: "bg-primary-dark",
  },
  secondary: {
    container: "bg-white border border-primary rounded-button px-6 py-3",
    text: "text-primary font-semibold text-base",
    pressed: "bg-neutral-50",
  },
  ghost: {
    container: "rounded-button px-6 py-3",
    text: "text-primary font-medium text-base",
    pressed: "bg-neutral-100",
  },
  accent: {
    container: "bg-accent rounded-button px-6 py-3",
    text: "text-white font-semibold text-base",
    pressed: "bg-accent-dark",
  },
} as const;

interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: keyof typeof VARIANTS;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: string;
  fullWidth?: boolean;
  haptic?: boolean;
}

const SIZE_CLASSES = {
  sm: { container: "px-4 py-2", text: "text-sm" },
  md: { container: "px-6 py-3", text: "text-base" },
  lg: { container: "px-8 py-4", text: "text-lg" },
};

export const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      children,
      fullWidth = false,
      haptic = true,
      disabled,
      onPress,
      className,
      ...props
    },
    ref,
  ) => {
    const scale = useSharedValue(1);
    const v = VARIANTS[variant];
    const s = SIZE_CLASSES[size];

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const handlePress = (e: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(e);
    };

    return (
      <AnimatedPressable
        ref={ref}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        className={`items-center justify-center flex-row ${v.container} ${s.container} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
        style={animatedStyle}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" || variant === "accent" ? "#fff" : "#6B8F71"}
          />
        ) : (
          <Text className={`${v.text} ${s.text}`}>{children}</Text>
        )}
      </AnimatedPressable>
    );
  },
);

Button.displayName = "Button";
```

**Step 3: Create `components/ui/Card.tsx`**

```tsx
import { Pressable, View, type PressableProps, type ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps extends ViewProps {
  pressable?: false;
}

interface PressableCardProps extends Omit<PressableProps, "style"> {
  pressable: true;
  className?: string;
}

type Props = CardProps | PressableCardProps;

export function Card(props: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (props.pressable) {
    const { pressable: _, className, children, ...rest } = props;
    return (
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        className={`rounded-card bg-white shadow-sm ${className ?? ""}`}
        style={animatedStyle}
        {...rest}
      >
        {children}
      </AnimatedPressable>
    );
  }

  const { pressable: _, className, children, ...rest } = props;
  return (
    <View className={`rounded-card bg-white shadow-sm ${className ?? ""}`} {...rest}>
      {children}
    </View>
  );
}
```

**Step 4: Create `components/ui/Input.tsx`**

```tsx
import { forwardRef, useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    const borderClass = error
      ? "border-error"
      : focused
        ? "border-primary"
        : "border-neutral-200";

    return (
      <View className={className}>
        {label && (
          <Text className="mb-1 text-sm font-medium text-text">{label}</Text>
        )}
        <View
          className={`flex-row items-center rounded-button border bg-white px-3 py-3 ${borderClass}`}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 text-base text-text"
            placeholderTextColor="#B8B4AF"
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
        {error && <Text className="mt-1 text-xs text-error">{error}</Text>}
        {helperText && !error && (
          <Text className="mt-1 text-xs text-neutral-400">{helperText}</Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
```

**Step 5: Create `components/ui/TextArea.tsx`**

```tsx
import { forwardRef, useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  showCount?: boolean;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  ({ label, error, showCount, maxLength, value, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const borderClass = error
      ? "border-error"
      : focused
        ? "border-primary"
        : "border-neutral-200";

    return (
      <View className={className}>
        {label && (
          <Text className="mb-1 text-sm font-medium text-text">{label}</Text>
        )}
        <View className={`rounded-button border bg-white px-3 py-3 ${borderClass}`}>
          <TextInput
            ref={ref}
            className="min-h-[100px] text-base text-text"
            placeholderTextColor="#B8B4AF"
            multiline
            textAlignVertical="top"
            maxLength={maxLength}
            value={value}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </View>
        <View className="flex-row justify-between">
          {error ? (
            <Text className="mt-1 text-xs text-error">{error}</Text>
          ) : (
            <View />
          )}
          {showCount && maxLength && (
            <Text className="mt-1 text-xs text-neutral-400">
              {(value?.length ?? 0)}/{maxLength}
            </Text>
          )}
        </View>
      </View>
    );
  },
);

TextArea.displayName = "TextArea";
```

**Step 6: Create `components/ui/Skeleton.tsx`**

Replaces the existing `components/common/SkeletonLoader.tsx` with animated shimmer:

```tsx
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  rounded?: boolean;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 20,
  rounded = false,
  className,
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-neutral-200 ${rounded ? "rounded-full" : "rounded-md"} ${className ?? ""}`}
      style={[{ width, height }, animatedStyle]}
    />
  );
}

/** Pre-composed skeleton for a listing card */
export function ListingCardSkeleton() {
  return (
    <View className="rounded-card bg-white p-3 shadow-sm">
      <Skeleton height={140} className="rounded-lg" />
      <Skeleton width="70%" height={16} className="mt-3" />
      <View className="mt-2 flex-row justify-between">
        <Skeleton width={60} height={14} />
        <Skeleton width={40} height={14} />
      </View>
      <View className="mt-2 flex-row items-center">
        <Skeleton width={24} height={24} rounded />
        <Skeleton width={80} height={12} className="ml-2" />
      </View>
    </View>
  );
}

/** Pre-composed skeleton for a message thread row */
export function ThreadRowSkeleton() {
  return (
    <View className="flex-row items-center px-4 py-3">
      <Skeleton width={48} height={48} rounded />
      <View className="ml-3 flex-1">
        <Skeleton width="40%" height={14} />
        <Skeleton width="80%" height={12} className="mt-2" />
      </View>
      <Skeleton width={40} height={10} />
    </View>
  );
}
```

**Step 7: Create `components/ui/EmptyState.tsx`**

```tsx
import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Icon size={32} color="#8F8A84" />
      </View>
      <Text className="text-center text-lg font-semibold text-text">{title}</Text>
      <Text className="mt-2 text-center text-sm text-neutral-400">{description}</Text>
      {actionLabel && onAction && (
        <View className="mt-6">
          <Button variant="primary" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
}
```

**Step 8: Create `components/ui/StickyBottomBar.tsx`**

```tsx
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StickyBottomBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyBottomBar({ children, className }: StickyBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`border-t border-neutral-200 bg-white px-4 pt-3 ${className ?? ""}`}
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {children}
    </View>
  );
}
```

**Step 9: Create `components/ui/index.ts`**

```ts
export { Button } from "./Button";
export { Card } from "./Card";
export { Input } from "./Input";
export { TextArea } from "./TextArea";
export { Skeleton, ListingCardSkeleton, ThreadRowSkeleton } from "./Skeleton";
export { EmptyState } from "./EmptyState";
export { StickyBottomBar } from "./StickyBottomBar";
```

**Step 10: Verify**

Run: `cd apps/mobile && pnpm expo start --web`
Expected: App starts, no import errors. Home screen still works.

**Step 11: Commit**

```bash
git add apps/mobile/package.json apps/mobile/components/ui/ pnpm-lock.yaml
git commit -m "feat: install @rn-primitives + core design component library"
```

---

## Task 2: Extended Fixtures + Mock Services

**Files:**
- Modify: `apps/mobile/fixtures/factories.ts` — add createThread, createReview, createEvent
- Modify: `apps/mobile/fixtures/scenarios.ts` — add MOCK_THREADS, MOCK_REVIEWS, MOCK_EVENTS
- Modify: `apps/mobile/fixtures/index.ts` — export new items
- Create: `apps/mobile/services/types.ts` — extend with ThreadService, ReviewService, EventService
- Modify: `apps/mobile/services/mock/messages.ts` — enhance with thread list + auto-reply
- Create: `apps/mobile/services/mock/reviews.ts`
- Create: `apps/mobile/services/mock/events.ts`
- Create: `apps/mobile/stores/searchStore.ts` — recent searches, filters

**Step 1: Extend `fixtures/factories.ts`** — add after existing factories:

```ts
// Add these imports at top:
// import type { Review, GoogooEvent } from "@googoo/shared";

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

export function createReview(overrides?: Partial<{
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  reviewee_id: string;
  rating: boolean;
  comment: string | null;
  created_at: string;
}>) {
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

export function createEvent(overrides?: Partial<{
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
}>) {
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
```

**Step 2: Extend `fixtures/scenarios.ts`** — add after existing scenarios:

```ts
// Import new factories
// import { createThread, createReview, createEvent } from "./factories";

export const MOCK_THREADS: Thread[] = [
  createThread({
    otherUser: MOCK_PROFILES[1] ? {
      id: MOCK_PROFILES[1].id,
      display_name: MOCK_PROFILES[1].display_name,
      avatar_url: MOCK_PROFILES[1].avatar_url,
    } : undefined,
    lastMessage: "Hey, is the stroller still available?",
    unread: true,
    listingTitle: MOCK_LISTINGS[0]?.title ?? "Baby Stroller",
    listingImage: MOCK_LISTINGS[0]?.images[0] ?? null,
    listingId: MOCK_LISTINGS[0]?.id ?? null,
  }),
  createThread({
    otherUser: MOCK_PROFILES[2] ? {
      id: MOCK_PROFILES[2].id,
      display_name: MOCK_PROFILES[2].display_name,
      avatar_url: MOCK_PROFILES[2].avatar_url,
    } : undefined,
    lastMessage: "Perfect, see you at the park Saturday!",
    unread: false,
    listingTitle: MOCK_LISTINGS[3]?.title ?? "Baby Clothes",
    listingImage: MOCK_LISTINGS[3]?.images[0] ?? null,
    listingId: MOCK_LISTINGS[3]?.id ?? null,
  }),
  createThread({
    otherUser: MOCK_PROFILES[3] ? {
      id: MOCK_PROFILES[3].id,
      display_name: MOCK_PROFILES[3].display_name,
      avatar_url: MOCK_PROFILES[3].avatar_url,
    } : undefined,
    lastMessage: "Thanks for the trade! My kid loves the blocks.",
    unread: false,
    listingId: null,
    listingTitle: null,
    listingImage: null,
  }),
  ...Array.from({ length: 5 }, () => createThread()),
];

export const MOCK_REVIEWS = MOCK_PROFILES.slice(1, 6).map((profile) =>
  createReview({
    reviewer_id: profile.id,
    reviewer_name: profile.display_name,
    reviewer_avatar: profile.avatar_url,
    reviewee_id: MOCK_CURRENT_USER.id,
  }),
);

export const MOCK_EVENTS = MOCK_GROUPS.slice(0, 3).map((group) =>
  createEvent({
    group_id: group.id,
    group_name: group.name,
    creator_id: MOCK_PROFILES[Math.floor(Math.random() * 5)]?.id ?? MOCK_CURRENT_USER.id,
  }),
);
```

**Step 3: Create `stores/searchStore.ts`**

```ts
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
```

**Step 4: Extend mock services** — update `services/mock/messages.ts` to support thread listing and auto-reply:

```ts
import type { Message } from "@googoo/shared";
import type { MessageService } from "../types";

let mockMessages: Message[] = [];
let mockThreads: typeof import("../../fixtures").MOCK_THREADS = [];
let fixturesLoaded = false;

async function ensureFixtures() {
  if (!fixturesLoaded) {
    const fixtures = require("../../fixtures");
    mockMessages = [...fixtures.MOCK_MESSAGES];
    mockThreads = [...fixtures.MOCK_THREADS];
    fixturesLoaded = true;
  }
}

export const mockMessageService: MessageService = {
  async fetchThreads() {
    await ensureFixtures();
    return mockThreads;
  },

  async fetchThread(threadId: string) {
    await ensureFixtures();
    return mockMessages.filter((m) => m.thread_id === threadId);
  },

  async send(threadId: string, content: string) {
    await ensureFixtures();
    const fixtures = require("../../fixtures");
    const msg: Message = {
      id: `mock-${Date.now()}`,
      thread_id: threadId,
      sender_id: fixtures.MOCK_CURRENT_USER.id,
      content,
      listing_id: null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    mockMessages.push(msg);

    // Auto-reply after 1-2 seconds
    setTimeout(() => {
      const replies = [
        "Sounds great! When works for you?",
        "Still available! Want to meet at Wright Park?",
        "I can do Saturday afternoon if that works?",
        "Sure thing! It's in great condition.",
        "Let me check and get back to you!",
      ];
      const reply: Message = {
        id: `mock-${Date.now()}-reply`,
        thread_id: threadId,
        sender_id: mockThreads.find((t) => t.id === threadId)?.otherUser.id ?? "unknown",
        content: replies[Math.floor(Math.random() * replies.length)]!,
        listing_id: null,
        read_at: null,
        created_at: new Date().toISOString(),
      };
      mockMessages.push(reply);
    }, 1000 + Math.random() * 1500);

    return msg;
  },
};
```

**Step 5: Update `services/types.ts`** — add fetchThreads to MessageService:

Add to the MessageService interface:

```ts
  fetchThreads(): Promise<Thread[]>;
```

Import the Thread type from fixtures/factories.

**Step 6: Verify**

Run: `pnpm --filter @googoo/mobile typecheck`
Expected: No type errors with new fixtures and services.

**Step 7: Commit**

```bash
git add apps/mobile/fixtures/ apps/mobile/services/ apps/mobile/stores/searchStore.ts
git commit -m "feat: extend fixtures with threads/reviews/events, add search store"
```

---

## Task 3: Listing Detail Screen (Journey 1)

**Files:**
- Create: `apps/mobile/components/ui/ImageCarousel.tsx`
- Create: `apps/mobile/components/ui/Chip.tsx`
- Create: `apps/mobile/components/ui/ChipGroup.tsx`
- Create: `apps/mobile/components/listings/ListingDetail.tsx`
- Modify: `apps/mobile/app/listing/[id].tsx` — full implementation
- Create: `apps/mobile/hooks/useListingDetail.ts`
- Modify: `apps/mobile/components/ui/index.ts` — add exports

**Step 1: Create `components/ui/ImageCarousel.tsx`**

```tsx
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ImageCarouselProps {
  images: string[];
  height?: number;
}

export function ImageCarousel({ images, height = 300 }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width: SCREEN_WIDTH, height }}
            resizeMode="cover"
          />
        )}
      />
      {images.length > 1 && (
        <View className="absolute bottom-3 flex-row justify-center self-center">
          {images.map((_, i) => (
            <DotIndicator key={i} active={i === activeIndex} />
          ))}
        </View>
      )}
    </View>
  );
}

function DotIndicator({ active }: { active: boolean }) {
  const scale = useSharedValue(active ? 1.2 : 1);
  scale.value = withSpring(active ? 1.2 : 1, { damping: 15 });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: active ? "#6B8F71" : "#D9D6D2",
  }));

  return (
    <Animated.View
      className="mx-1 h-2 w-2 rounded-full"
      style={animatedStyle}
    />
  );
}
```

**Step 2: Create `components/ui/Chip.tsx`**

```tsx
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
  variant?: "default" | "filter";
}

export function Chip({
  label,
  selected = false,
  onPress,
  onDismiss,
  variant = "default",
}: ChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(1.1, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const bgClass = selected ? "bg-primary" : "bg-neutral-100";
  const textClass = selected ? "text-white" : "text-text";

  return (
    <AnimatedPressable
      onPress={handlePress}
      className={`flex-row items-center rounded-full px-3 py-1.5 ${bgClass}`}
      style={animatedStyle}
    >
      <Text className={`text-sm font-medium ${textClass}`}>{label}</Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} className="ml-1">
          <X size={14} color={selected ? "#fff" : "#6B665F"} />
        </Pressable>
      )}
    </AnimatedPressable>
  );
}
```

**Step 3: Create `components/ui/ChipGroup.tsx`**

```tsx
import { View } from "react-native";

import { Chip } from "./Chip";

interface ChipGroupProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
  multiple?: boolean;
}

export function ChipGroup<T extends string>({
  options,
  selected,
  onChange,
  multiple = true,
}: ChipGroupProps<T>) {
  const handlePress = (value: T) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter((s) => s !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          selected={selected.includes(opt.value)}
          onPress={() => handlePress(opt.value)}
        />
      ))}
    </View>
  );
}
```

**Step 4: Create `hooks/useListingDetail.ts`**

```ts
import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";

export function useListingDetail(id: string) {
  const { listings } = useServices();

  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => listings.fetchById(id),
    enabled: !!id,
  });
}
```

**Step 5: Implement `app/listing/[id].tsx`** — full listing detail:

```tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  MapPin,
  MessageCircle,
  DollarSign,
  ArrowLeftRight,
  Clock,
  Tag,
  Truck,
  Star,
} from "lucide-react-native";
import { ScrollView, Text, View, Pressable } from "react-native";

import { formatDistance, formatPrice } from "@googoo/shared";

import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { Button, StickyBottomBar, ImageCarousel, Skeleton } from "@/components/ui";
import { useListingDetail } from "@/hooks/useListingDetail";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading } = useListingDetail(id);

  if (isLoading || !listing) {
    return (
      <View className="flex-1 bg-background">
        <Skeleton height={300} />
        <View className="p-4">
          <Skeleton width="60%" height={24} className="mt-4" />
          <Skeleton width="30%" height={20} className="mt-3" />
          <Skeleton width="100%" height={60} className="mt-4" />
        </View>
      </View>
    );
  }

  const priceDisplay =
    listing.listing_type === "swap"
      ? "Swap"
      : listing.listing_type === "free"
        ? "Free"
        : formatPrice(listing.price_cents);

  const badgeVariant =
    listing.listing_type === "swap"
      ? "primary"
      : listing.listing_type === "free"
        ? "accent"
        : "neutral";

  const conditionLabels: Record<string, string> = {
    new_with_tags: "New with tags",
    like_new: "Like new",
    good: "Good",
    fair: "Fair",
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <ImageCarousel images={listing.images} height={320} />

        <View className="p-4">
          {/* Price + Badges */}
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-bold text-text">{priceDisplay}</Text>
            <Badge label={conditionLabels[listing.condition] ?? listing.condition} variant="neutral" />
            {listing.age_range && (
              <Badge label={listing.age_range.replace("_", "-")} variant="neutral" />
            )}
          </View>

          {/* Title */}
          <Text className="mt-2 text-xl font-semibold text-text">{listing.title}</Text>

          {/* Seller Row */}
          <Pressable
            className="mt-4 flex-row items-center rounded-card bg-white p-3 shadow-sm"
            onPress={() => router.push(`/profile/${listing.seller_id}`)}
          >
            <Avatar uri={listing.seller_avatar_url} size={44} />
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold text-text">
                {listing.seller_display_name}
              </Text>
              <View className="flex-row items-center">
                <Star size={12} color="#6B8F71" fill="#6B8F71" />
                <Text className="ml-1 text-sm text-neutral-400">4.8 rating</Text>
              </View>
            </View>
            <Text className="text-sm text-neutral-400">
              {formatDistance(listing.distance_m)}
            </Text>
          </Pressable>

          {/* Description */}
          {listing.description && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-neutral-500">Description</Text>
              <Text className="mt-1 text-base leading-relaxed text-text">
                {listing.description}
              </Text>
            </View>
          )}

          {/* Swap preferences */}
          {listing.listing_type === "swap" && listing.swap_preferences && (
            <View className="mt-4 rounded-card bg-primary/10 p-3">
              <View className="flex-row items-center">
                <ArrowLeftRight size={16} color="#6B8F71" />
                <Text className="ml-2 text-sm font-semibold text-primary">
                  Looking to swap for
                </Text>
              </View>
              <Text className="mt-1 text-sm text-text">{listing.swap_preferences}</Text>
            </View>
          )}

          {/* Details Grid */}
          <View className="mt-4 flex-row flex-wrap">
            <DetailItem icon={Tag} label="Category" value={listing.category} />
            <DetailItem
              icon={Star}
              label="Condition"
              value={conditionLabels[listing.condition] ?? listing.condition}
            />
            <DetailItem
              icon={Truck}
              label="Shipping"
              value={listing.ships ? "Available" : "Local only"}
            />
            <DetailItem
              icon={Clock}
              label="Posted"
              value={new Date(listing.created_at).toLocaleDateString()}
            />
          </View>

          {/* Map preview placeholder */}
          <View className="mt-4 h-32 items-center justify-center rounded-card bg-neutral-100">
            <MapPin size={24} color="#8F8A84" />
            <Text className="mt-1 text-sm text-neutral-400">
              {formatDistance(listing.distance_m)} away
            </Text>
          </View>

          {/* Bottom spacer for sticky bar */}
          <View className="h-24" />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar className="flex-row gap-3">
        <View className="flex-1">
          <Button
            variant="primary"
            fullWidth
            onPress={() => {
              const threadId = `thread-${listing.id}`;
              router.push(`/messages/${threadId}`);
            }}
          >
            Message Seller
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="secondary" fullWidth onPress={() => {}}>
            {listing.listing_type === "swap" ? "Propose Swap" : "Make an Offer"}
          </Button>
        </View>
      </StickyBottomBar>
    </View>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <View className="w-1/2 flex-row items-center py-2">
      <Icon size={16} color="#8F8A84" />
      <View className="ml-2">
        <Text className="text-xs text-neutral-400">{label}</Text>
        <Text className="text-sm font-medium text-text">{value}</Text>
      </View>
    </View>
  );
}
```

**Step 6: Verify**

Run: `pnpm expo start --web`
Navigate to: Home → tap any listing card
Expected: Full listing detail with image carousel, price, seller info, description, details grid, and sticky bottom bar with "Message Seller" + "Make an Offer" buttons.

**Step 7: Commit**

```bash
git add apps/mobile/components/ui/ apps/mobile/components/listings/ apps/mobile/hooks/useListingDetail.ts apps/mobile/app/listing/
git commit -m "feat: listing detail screen with image carousel, seller info, and action bar"
```

---

## Task 4: Search Tab with Filters (Journey 2)

**Files:**
- Create: `apps/mobile/components/ui/BottomSheet.tsx`
- Create: `apps/mobile/components/search/FilterSheet.tsx`
- Create: `apps/mobile/components/search/CategoryGrid.tsx`
- Create: `apps/mobile/hooks/useSearchListings.ts`
- Modify: `apps/mobile/app/(tabs)/search.tsx` — full implementation
- Modify: `apps/mobile/components/ui/index.ts` — add exports

**Step 1: Create `components/ui/BottomSheet.tsx`**

```tsx
import { forwardRef, useCallback } from "react";
import { Text, View } from "react-native";
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetProps as GorhomProps,
} from "@gorhom/bottom-sheet";

interface BottomSheetProps extends Partial<GorhomProps> {
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet = forwardRef<GorhomBottomSheet, BottomSheetProps>(
  ({ title, children, snapPoints = ["50%", "85%"], ...props }, ref) => {
    const renderBackdrop = useCallback(
      (backdropProps: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#D9D6D2" }}
        backgroundStyle={{ backgroundColor: "#F7F5F3" }}
        {...props}
      >
        {title && (
          <View className="border-b border-neutral-200 px-4 pb-3">
            <Text className="text-lg font-semibold text-text">{title}</Text>
          </View>
        )}
        <BottomSheetScrollView className="px-4 pt-4">
          {children}
        </BottomSheetScrollView>
      </GorhomBottomSheet>
    );
  },
);

BottomSheet.displayName = "BottomSheet";
```

**Step 2: Create `components/search/CategoryGrid.tsx`**

```tsx
import { Pressable, Text, View } from "react-native";
import {
  Shirt,
  Baby,
  Blocks,
  Lamp,
  CupSoda,
  Bath,
  Heart,
  Package,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { CATEGORIES, type CategoryKey } from "@/constants/categories";

const ICON_MAP: Record<string, LucideIcon> = {
  shirt: Shirt,
  baby: Baby,
  blocks: Blocks,
  lamp: Lamp,
  "cup-soda": CupSoda,
  bath: Bath,
  heart: Heart,
  package: Package,
};

interface CategoryGridProps {
  onSelect: (category: CategoryKey) => void;
  selected?: CategoryKey | null;
}

export function CategoryGrid({ onSelect, selected }: CategoryGridProps) {
  return (
    <View className="flex-row flex-wrap">
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] ?? Package;
        const isSelected = selected === cat.key;
        return (
          <View key={cat.key} className="w-1/4 items-center p-2">
            <Pressable
              onPress={() => onSelect(cat.key)}
              className={`h-16 w-16 items-center justify-center rounded-2xl ${
                isSelected ? "bg-primary" : "bg-white shadow-sm"
              }`}
            >
              <Icon size={24} color={isSelected ? "#fff" : "#6B8F71"} />
            </Pressable>
            <Text
              className={`mt-1 text-center text-xs ${isSelected ? "font-semibold text-primary" : "text-neutral-500"}`}
            >
              {cat.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
```

**Step 3: Create `components/search/FilterSheet.tsx`**

```tsx
import { forwardRef } from "react";
import { Slider } from "react-native";
import { Text, View } from "react-native";
import GorhomBottomSheet from "@gorhom/bottom-sheet";

import type { ItemCondition, AgeRange } from "@googoo/shared";

import { Button, ChipGroup } from "@/components/ui";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useSearchStore, type SearchFilters } from "@/stores/searchStore";

const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: "new_with_tags", label: "New with tags" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "newborn", label: "Newborn" },
  { value: "0_3mo", label: "0-3 mo" },
  { value: "3_6mo", label: "3-6 mo" },
  { value: "6_12mo", label: "6-12 mo" },
  { value: "1_2yr", label: "1-2 yr" },
  { value: "2_4yr", label: "2-4 yr" },
  { value: "4_6yr", label: "4-6 yr" },
];

const SORT_OPTIONS: { value: SearchFilters["sortBy"]; label: string }[] = [
  { value: "distance", label: "Distance" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
];

interface FilterSheetProps {
  onApply: () => void;
}

export const FilterSheet = forwardRef<GorhomBottomSheet, FilterSheetProps>(
  ({ onApply }, ref) => {
    const { filters, setFilters, resetFilters } = useSearchStore();

    return (
      <BottomSheet ref={ref} title="Filters" snapPoints={["85%"]}>
        <View className="pb-8">
          {/* Distance */}
          <Text className="mb-2 text-sm font-semibold text-text">Distance</Text>
          <Text className="text-sm text-neutral-400">
            {Math.round(filters.maxDistance / 1609)} miles
          </Text>
          <Slider
            minimumValue={1609}
            maximumValue={80467}
            step={1609}
            value={filters.maxDistance}
            onValueChange={(v) => setFilters({ maxDistance: v })}
            minimumTrackTintColor="#6B8F71"
            maximumTrackTintColor="#D9D6D2"
          />

          {/* Condition */}
          <Text className="mb-2 mt-6 text-sm font-semibold text-text">Condition</Text>
          <ChipGroup
            options={CONDITION_OPTIONS}
            selected={filters.conditions}
            onChange={(conditions) => setFilters({ conditions })}
          />

          {/* Age Range */}
          <Text className="mb-2 mt-6 text-sm font-semibold text-text">Age Range</Text>
          <ChipGroup
            options={AGE_OPTIONS}
            selected={filters.ageRanges}
            onChange={(ageRanges) => setFilters({ ageRanges })}
          />

          {/* Sort */}
          <Text className="mb-2 mt-6 text-sm font-semibold text-text">Sort by</Text>
          <ChipGroup
            options={SORT_OPTIONS}
            selected={[filters.sortBy]}
            onChange={(vals) => {
              if (vals.length > 0) setFilters({ sortBy: vals[vals.length - 1] });
            }}
            multiple={false}
          />

          {/* Actions */}
          <View className="mt-8 flex-row gap-3">
            <View className="flex-1">
              <Button variant="ghost" fullWidth onPress={resetFilters}>
                Reset
              </Button>
            </View>
            <View className="flex-1">
              <Button variant="primary" fullWidth onPress={onApply}>
                Apply
              </Button>
            </View>
          </View>
        </View>
      </BottomSheet>
    );
  },
);

FilterSheet.displayName = "FilterSheet";
```

**Step 4: Create `hooks/useSearchListings.ts`**

```ts
import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";
import { useLocationStore } from "@/stores/locationStore";
import { useSearchStore } from "@/stores/searchStore";

export function useSearchListings() {
  const { listings } = useServices();
  const { lat, lng } = useLocationStore();
  const { query, filters } = useSearchStore();

  return useQuery({
    queryKey: ["listings", "search", query, filters, lat, lng],
    queryFn: () =>
      listings.search({
        query,
        lat,
        lng,
        radiusMeters: filters.maxDistance,
        limit: 20,
        offset: 0,
      }),
    enabled: lat !== 0 && lng !== 0 && query.length > 0,
  });
}
```

**Step 5: Implement `app/(tabs)/search.tsx`** — full search screen:

```tsx
import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import GorhomBottomSheet from "@gorhom/bottom-sheet";
import { Search, SlidersHorizontal, X } from "lucide-react-native";

import { ListingCard } from "@/components/listings/ListingCard";
import { CategoryGrid } from "@/components/search/CategoryGrid";
import { FilterSheet } from "@/components/search/FilterSheet";
import { Chip, EmptyState, ListingCardSkeleton } from "@/components/ui";
import { useSearchListings } from "@/hooks/useSearchListings";
import { useSearchStore } from "@/stores/searchStore";
import type { CategoryKey } from "@/constants/categories";
import { PackageSearch } from "lucide-react-native";

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const filterRef = useRef<GorhomBottomSheet>(null);
  const {
    query,
    setQuery,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    filters,
    setFilters,
    activeFilterCount,
  } = useSearchStore();
  const { data: results, isLoading } = useSearchListings();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (text.length > 0) {
        setIsSearching(true);
      }
    },
    [setQuery],
  );

  const handleSubmit = useCallback(() => {
    if (query.length > 0) {
      addRecentSearch(query);
      setIsSearching(true);
    }
  }, [query, addRecentSearch]);

  const handleCategorySelect = useCallback(
    (category: CategoryKey) => {
      setFilters({ category });
      setQuery(category);
      setIsSearching(true);
      addRecentSearch(category);
    },
    [setFilters, setQuery, addRecentSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setIsSearching(false);
    inputRef.current?.focus();
  }, [setQuery]);

  const filterCount = activeFilterCount();

  return (
    <View className="flex-1 bg-background">
      {/* Search Bar */}
      <View className="border-b border-neutral-200 bg-white px-4 pb-3 pt-2">
        <View className="flex-row items-center rounded-full bg-neutral-50 px-3 py-2">
          <Search size={18} color="#8F8A84" />
          <TextInput
            ref={inputRef}
            className="ml-2 flex-1 text-base text-text"
            placeholder="Search baby gear, clothes, toys..."
            placeholderTextColor="#B8B4AF"
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear}>
              <X size={18} color="#8F8A84" />
            </Pressable>
          )}
        </View>

        {/* Filter bar */}
        {isSearching && (
          <View className="mt-2 flex-row items-center">
            <Pressable
              onPress={() => filterRef.current?.snapToIndex(0)}
              className="flex-row items-center rounded-full bg-neutral-100 px-3 py-1.5"
            >
              <SlidersHorizontal size={14} color="#6B665F" />
              <Text className="ml-1 text-sm text-text">Filters</Text>
              {filterCount > 0 && (
                <View className="ml-1 h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <Text className="text-xs font-bold text-white">{filterCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {!isSearching ? (
        /* Default state */
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View className="p-4">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <View className="mb-6">
                  <Text className="mb-2 text-sm font-semibold text-neutral-500">
                    Recent searches
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        onPress={() => {
                          setQuery(s);
                          setIsSearching(true);
                        }}
                        onDismiss={() => removeRecentSearch(s)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Categories */}
              <Text className="mb-3 text-sm font-semibold text-neutral-500">
                Browse categories
              </Text>
              <CategoryGrid
                onSelect={handleCategorySelect}
                selected={filters.category as CategoryKey | null}
              />
            </View>
          }
        />
      ) : isLoading ? (
        /* Loading state */
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={() => (
            <View className="px-4 py-2">
              <ListingCardSkeleton />
            </View>
          )}
          keyExtractor={(i) => i.toString()}
        />
      ) : results && results.length > 0 ? (
        /* Results */
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <Text className="px-4 py-3 text-sm text-neutral-400">
              {results.length} items found
            </Text>
          }
          renderItem={({ item }) => (
            <View className="px-4 py-2">
              <ListingCard
                listing={item}
                onPress={() => router.push(`/listing/${item.id}`)}
              />
            </View>
          )}
        />
      ) : query.length > 0 ? (
        /* Empty results */
        <EmptyState
          icon={PackageSearch}
          title="No items found"
          description="Try adjusting your filters or searching for something else."
          actionLabel="Clear search"
          onAction={handleClear}
        />
      ) : null}

      {/* Filter Bottom Sheet */}
      <FilterSheet
        ref={filterRef}
        onApply={() => filterRef.current?.close()}
      />
    </View>
  );
}
```

**Step 6: Verify**

Navigate to: Search tab
Expected: Search bar, recent search chips, category grid. Type a query → results appear. Tap "Filters" → bottom sheet with condition/age/sort chips.

**Step 7: Commit**

```bash
git add apps/mobile/components/ui/ apps/mobile/components/search/ apps/mobile/hooks/useSearchListings.ts apps/mobile/app/
git commit -m "feat: search tab with category grid, filters bottom sheet, and results"
```

---

## Task 5: Create Listing Flow (Journey 3)

**Files:**
- Modify: `apps/mobile/app/listing/create.tsx` — full multi-step form
- Create: `apps/mobile/components/listings/CreateListingSteps.tsx`
- Create: `apps/mobile/components/listings/StepIndicator.tsx`
- Create: `apps/mobile/hooks/useCreateListing.ts`

This task implements the 4-step creation flow: Photos → Details → Pricing → Review.

**Step 1: Create `components/listings/StepIndicator.tsx`**

```tsx
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View className="px-4 py-3">
      <View className="flex-row items-center justify-center gap-2">
        {steps.map((_, i) => (
          <StepDot key={i} active={i <= currentStep} current={i === currentStep} />
        ))}
      </View>
      <Text className="mt-2 text-center text-sm font-medium text-neutral-500">
        Step {currentStep + 1}: {steps[currentStep]}
      </Text>
    </View>
  );
}

function StepDot({ active, current }: { active: boolean; current: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(current ? 24 : 8, { damping: 15 }),
    backgroundColor: active ? "#6B8F71" : "#D9D6D2",
  }));

  return <Animated.View className="h-2 rounded-full" style={animatedStyle} />;
}
```

**Step 2: Create `hooks/useCreateListing.ts`**

```ts
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import type { ListingType, ItemCondition, AgeRange } from "@googoo/shared";

export interface ListingDraft {
  images: string[];
  title: string;
  description: string;
  category: string;
  condition: ItemCondition | null;
  ageRange: AgeRange | null;
  listingType: ListingType;
  priceCents: number | null;
  swapPreferences: string;
  ships: boolean;
}

const INITIAL_DRAFT: ListingDraft = {
  images: [],
  title: "",
  description: "",
  category: "",
  condition: null,
  ageRange: null,
  listingType: "sell",
  priceCents: null,
  swapPreferences: "",
  ships: false,
};

export function useCreateListing() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>(INITIAL_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateDraft = (partial: Partial<ListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return draft.images.length > 0;
      case 1:
        return draft.title.length >= 3 && draft.category !== "" && draft.condition !== null;
      case 2:
        return (
          draft.listingType === "free" ||
          draft.listingType === "swap" ||
          (draft.listingType === "sell" && draft.priceCents !== null && draft.priceCents > 0)
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const next = () => {
    if (step < 3 && canAdvance()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step + 1);
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const submit = async () => {
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Mock delay
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const reset = () => {
    setDraft(INITIAL_DRAFT);
    setStep(0);
    setIsSuccess(false);
  };

  return {
    step,
    draft,
    updateDraft,
    canAdvance,
    next,
    back,
    submit,
    reset,
    isSubmitting,
    isSuccess,
  };
}
```

**Step 3: Implement `app/listing/create.tsx`** — full multi-step form:

```tsx
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  X,
  DollarSign,
  ArrowLeftRight,
  Gift,
  Check,
  PartyPopper,
} from "lucide-react-native";

import { formatPrice } from "@googoo/shared";

import { Badge } from "@/components/common/Badge";
import { Button, Card, Input, TextArea, StickyBottomBar } from "@/components/ui";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { StepIndicator } from "@/components/listings/StepIndicator";
import { useCreateListing } from "@/hooks/useCreateListing";
import { CATEGORIES } from "@/constants/categories";
import { CONFIG } from "@/constants/config";
import type { ItemCondition, AgeRange, ListingType } from "@googoo/shared";

const STEPS = ["Photos", "Details", "Pricing", "Review"];

const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: "new_with_tags", label: "New with tags" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: "newborn", label: "Newborn" },
  { value: "0_3mo", label: "0-3 mo" },
  { value: "3_6mo", label: "3-6 mo" },
  { value: "6_12mo", label: "6-12 mo" },
  { value: "1_2yr", label: "1-2 yr" },
  { value: "2_4yr", label: "2-4 yr" },
  { value: "4_6yr", label: "4-6 yr" },
];

export default function CreateListingScreen() {
  const router = useRouter();
  const {
    step,
    draft,
    updateDraft,
    canAdvance,
    next,
    back,
    submit,
    reset,
    isSubmitting,
    isSuccess,
  } = useCreateListing();

  const pickImage = async () => {
    if (draft.images.length >= CONFIG.MAX_LISTING_IMAGES) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: CONFIG.IMAGE_QUALITY,
    });
    if (!result.canceled && result.assets[0]) {
      updateDraft({ images: [...draft.images, result.assets[0].uri] });
    }
  };

  const removeImage = (index: number) => {
    updateDraft({ images: draft.images.filter((_, i) => i !== index) });
  };

  if (isSuccess) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <PartyPopper size={40} color="#6B8F71" />
        </View>
        <Text className="text-2xl font-bold text-text">Your listing is live!</Text>
        <Text className="mt-2 text-center text-neutral-400">
          Other parents nearby can now see your listing.
        </Text>
        <View className="mt-8 w-full gap-3">
          <Button variant="primary" fullWidth onPress={() => router.back()}>
            View Listing
          </Button>
          <Button variant="ghost" fullWidth onPress={reset}>
            List Another Item
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StepIndicator steps={STEPS} currentStep={step} />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {step === 0 && (
          /* Step 1: Photos */
          <View>
            <Text className="mb-3 text-base font-semibold text-text">
              Add photos ({draft.images.length}/{CONFIG.MAX_LISTING_IMAGES})
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {draft.images.map((uri, i) => (
                <View key={i} className="relative">
                  <Image
                    source={{ uri }}
                    className={`rounded-lg ${i === 0 ? "h-40 w-40" : "h-24 w-24"}`}
                  />
                  <Pressable
                    onPress={() => removeImage(i)}
                    className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-error"
                  >
                    <X size={12} color="#fff" />
                  </Pressable>
                  {i === 0 && (
                    <View className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5">
                      <Text className="text-xs text-white">Cover</Text>
                    </View>
                  )}
                </View>
              ))}
              {draft.images.length < CONFIG.MAX_LISTING_IMAGES && (
                <Pressable
                  onPress={pickImage}
                  className={`items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 ${
                    draft.images.length === 0 ? "h-40 w-40" : "h-24 w-24"
                  }`}
                >
                  <Camera size={24} color="#8F8A84" />
                  <Text className="mt-1 text-xs text-neutral-400">Add</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {step === 1 && (
          /* Step 2: Details */
          <View className="gap-4">
            <Input
              label="Title"
              placeholder="What are you listing?"
              value={draft.title}
              onChangeText={(title) => updateDraft({ title })}
              maxLength={100}
            />

            <View>
              <Text className="mb-2 text-sm font-medium text-text">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.key}
                    onPress={() => updateDraft({ category: cat.key })}
                    className={`rounded-full px-3 py-1.5 ${
                      draft.category === cat.key ? "bg-primary" : "bg-neutral-100"
                    }`}
                  >
                    <Text
                      className={`text-sm ${draft.category === cat.key ? "font-semibold text-white" : "text-text"}`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-text">Condition</Text>
              <View className="flex-row flex-wrap gap-2">
                {CONDITION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => updateDraft({ condition: opt.value })}
                    className={`rounded-card border px-4 py-3 ${
                      draft.condition === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        draft.condition === opt.value ? "text-primary" : "text-text"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-text">Age range (optional)</Text>
              <ChipGroup
                options={AGE_OPTIONS}
                selected={draft.ageRange ? [draft.ageRange] : []}
                onChange={(vals) => updateDraft({ ageRange: vals[0] ?? null })}
                multiple={false}
              />
            </View>

            <TextArea
              label="Description (optional)"
              placeholder="Describe the item — condition details, why you're selling, etc."
              value={draft.description}
              onChangeText={(description) => updateDraft({ description })}
              maxLength={2000}
              showCount
            />
          </View>
        )}

        {step === 2 && (
          /* Step 3: Pricing */
          <View className="gap-4">
            <Text className="text-base font-semibold text-text">How do you want to list this?</Text>
            <View className="gap-3">
              {(
                [
                  { type: "sell" as ListingType, icon: DollarSign, label: "Sell", desc: "Set a price" },
                  { type: "swap" as ListingType, icon: ArrowLeftRight, label: "Swap", desc: "Trade for something" },
                  { type: "free" as ListingType, icon: Gift, label: "Free", desc: "Give it away" },
                ] as const
              ).map(({ type, icon: Icon, label, desc }) => (
                <Pressable
                  key={type}
                  onPress={() => updateDraft({ listingType: type })}
                  className={`flex-row items-center rounded-card border p-4 ${
                    draft.listingType === type
                      ? "border-primary bg-primary/10"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      draft.listingType === type ? "bg-primary" : "bg-neutral-100"
                    }`}
                  >
                    <Icon size={20} color={draft.listingType === type ? "#fff" : "#8F8A84"} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-text">{label}</Text>
                    <Text className="text-sm text-neutral-400">{desc}</Text>
                  </View>
                  {draft.listingType === type && <Check size={20} color="#6B8F71" />}
                </Pressable>
              ))}
            </View>

            {draft.listingType === "sell" && (
              <Input
                label="Price"
                placeholder="0.00"
                keyboardType="numeric"
                leftIcon={<DollarSign size={16} color="#8F8A84" />}
                value={draft.priceCents ? (draft.priceCents / 100).toString() : ""}
                onChangeText={(text) => {
                  const cents = Math.round(parseFloat(text || "0") * 100);
                  updateDraft({ priceCents: isNaN(cents) ? null : cents });
                }}
              />
            )}

            {draft.listingType === "swap" && (
              <TextArea
                label="What do you want in return?"
                placeholder="Describe what you're looking for..."
                value={draft.swapPreferences}
                onChangeText={(swapPreferences) => updateDraft({ swapPreferences })}
                maxLength={500}
                showCount
              />
            )}
          </View>
        )}

        {step === 3 && (
          /* Step 4: Review */
          <View>
            <Text className="mb-4 text-base font-semibold text-text">Review your listing</Text>

            {/* Preview card */}
            <Card className="overflow-hidden">
              {draft.images[0] && (
                <Image
                  source={{ uri: draft.images[0] }}
                  className="h-48 w-full"
                  resizeMode="cover"
                />
              )}
              <View className="p-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg font-bold text-text">
                    {draft.listingType === "sell"
                      ? formatPrice(draft.priceCents)
                      : draft.listingType === "swap"
                        ? "Swap"
                        : "Free"}
                  </Text>
                  <Badge
                    label={CONDITION_OPTIONS.find((o) => o.value === draft.condition)?.label ?? ""}
                    variant="neutral"
                  />
                </View>
                <Text className="mt-1 text-base font-semibold text-text">{draft.title}</Text>
                {draft.description && (
                  <Text className="mt-1 text-sm text-neutral-400" numberOfLines={2}>
                    {draft.description}
                  </Text>
                )}
              </View>
            </Card>

            <View className="mt-4 gap-2">
              <ReviewRow label="Category" value={CATEGORIES.find((c) => c.key === draft.category)?.label ?? ""} onEdit={() => back()} />
              <ReviewRow label="Photos" value={`${draft.images.length} photo${draft.images.length !== 1 ? "s" : ""}`} onEdit={() => {}} />
              {draft.listingType === "swap" && draft.swapPreferences && (
                <ReviewRow label="Looking for" value={draft.swapPreferences} onEdit={() => {}} />
              )}
            </View>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Bottom bar */}
      <StickyBottomBar className="flex-row gap-3">
        {step > 0 && (
          <View className="flex-1">
            <Button variant="ghost" fullWidth onPress={back}>
              Back
            </Button>
          </View>
        )}
        <View className="flex-1">
          {step < 3 ? (
            <Button
              variant="primary"
              fullWidth
              disabled={!canAdvance()}
              onPress={next}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="accent"
              fullWidth
              loading={isSubmitting}
              onPress={submit}
            >
              Post Listing
            </Button>
          )}
        </View>
      </StickyBottomBar>
    </View>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <Pressable onPress={onEdit} className="flex-row items-center justify-between py-2">
      <Text className="text-sm text-neutral-400">{label}</Text>
      <Text className="text-sm font-medium text-text">{value}</Text>
    </Pressable>
  );
}
```

**Step 4: Verify**

Navigate to: Home → tap FAB (+ button)
Expected: 4-step creation flow. Step dots animate. Photos step with add button. Details with category/condition selection. Pricing with sell/swap/free cards. Review shows preview. "Post Listing" shows success screen.

**Step 5: Commit**

```bash
git add apps/mobile/app/listing/create.tsx apps/mobile/components/listings/ apps/mobile/hooks/useCreateListing.ts
git commit -m "feat: create listing 4-step flow with photos, details, pricing, and review"
```

---

## Task 6: Messaging — Inbox + Conversation (Journey 4)

**Files:**
- Create: `apps/mobile/components/messages/ThreadRow.tsx`
- Create: `apps/mobile/components/messages/MessageBubble.tsx`
- Create: `apps/mobile/hooks/useThreads.ts`
- Modify: `apps/mobile/app/messages/index.tsx` — full inbox
- Modify: `apps/mobile/app/messages/[threadId].tsx` — full conversation

**Step 1: Create `components/messages/ThreadRow.tsx`**

```tsx
import { Image, Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/common/Avatar";
import type { Thread } from "@/fixtures/factories";

interface ThreadRowProps {
  thread: Thread;
  onPress: () => void;
}

export function ThreadRow({ thread, onPress }: ThreadRowProps) {
  const timeAgo = getTimeAgo(thread.lastMessageAt);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-neutral-100 px-4 py-3"
    >
      <View className="relative">
        <Avatar uri={thread.otherUser.avatar_url} size={48} />
        {thread.unread && (
          <View className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-accent" />
        )}
      </View>

      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-base ${thread.unread ? "font-bold text-text" : "font-medium text-text"}`}
          >
            {thread.otherUser.display_name}
          </Text>
          <Text className="text-xs text-neutral-400">{timeAgo}</Text>
        </View>
        <Text
          className={`mt-0.5 text-sm ${thread.unread ? "font-medium text-text" : "text-neutral-400"}`}
          numberOfLines={1}
        >
          {thread.lastMessage}
        </Text>
        {thread.listingTitle && (
          <Text className="mt-0.5 text-xs text-neutral-300" numberOfLines={1}>
            Re: {thread.listingTitle}
          </Text>
        )}
      </View>

      {thread.listingImage && (
        <Image
          source={{ uri: thread.listingImage }}
          className="ml-2 h-10 w-10 rounded-lg"
        />
      )}
    </Pressable>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
```

**Step 2: Create `components/messages/MessageBubble.tsx`**

```tsx
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Avatar } from "@/components/common/Avatar";

interface MessageBubbleProps {
  content: string;
  isSent: boolean;
  senderAvatar?: string | null;
  showAvatar?: boolean;
  isRead?: boolean;
  timestamp: string;
}

export function MessageBubble({
  content,
  isSent,
  senderAvatar,
  showAvatar = false,
  isRead,
  timestamp,
}: MessageBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify()}
      className={`mb-2 flex-row ${isSent ? "justify-end" : "justify-start"}`}
    >
      {!isSent && showAvatar && (
        <Avatar uri={senderAvatar ?? null} size={28} />
      )}
      {!isSent && !showAvatar && <View className="w-7" />}

      <View
        className={`ml-2 max-w-[75%] rounded-2xl px-3 py-2 ${
          isSent ? "rounded-br-sm bg-primary" : "rounded-bl-sm bg-white"
        }`}
      >
        <Text className={`text-base ${isSent ? "text-white" : "text-text"}`}>
          {content}
        </Text>
        <View className={`mt-0.5 flex-row items-center ${isSent ? "justify-end" : ""}`}>
          <Text
            className={`text-xs ${isSent ? "text-white/60" : "text-neutral-300"}`}
          >
            {time}
          </Text>
          {isSent && isRead && (
            <Text className="ml-1 text-xs text-white/60">Read</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
```

**Step 3: Create `hooks/useThreads.ts`**

```ts
import { useQuery } from "@tanstack/react-query";

import { useServices } from "@/services/provider";

export function useThreads() {
  const { messages } = useServices();

  return useQuery({
    queryKey: ["threads"],
    queryFn: () => messages.fetchThreads(),
  });
}
```

**Step 4: Implement `app/messages/index.tsx`** — full inbox:

```tsx
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { MessageSquare } from "lucide-react-native";

import { ThreadRow } from "@/components/messages/ThreadRow";
import { EmptyState, ThreadRowSkeleton } from "@/components/ui";
import { useThreads } from "@/hooks/useThreads";

export default function InboxScreen() {
  const router = useRouter();
  const { data: threads, isLoading } = useThreads();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        {Array.from({ length: 6 }, (_, i) => (
          <ThreadRowSkeleton key={i} />
        ))}
      </View>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="Browse listings and start a conversation!"
        actionLabel="Browse listings"
        onAction={() => router.push("/(tabs)")}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThreadRow
            thread={item}
            onPress={() => router.push(`/messages/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
```

**Step 5: Implement `app/messages/[threadId].tsx`** — full conversation:

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Send } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Message } from "@googoo/shared";

import { MessageBubble } from "@/components/messages/MessageBubble";
import { Skeleton } from "@/components/ui";
import { useMessages } from "@/hooks/useMessages";
import { useServices } from "@/services/provider";
import { useAuthStore } from "@/stores/authStore";

export default function ConversationScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const currentUserId = useAuthStore((s) => s.session?.user.id);
  const { data: messages, isLoading } = useMessages(threadId);
  const { messages: messageService } = useServices();
  const queryClient = useQueryClient();

  // Poll for new messages (mock auto-reply)
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
    }, 2000);
    return () => clearInterval(interval);
  }, [threadId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => messageService.send(threadId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", threadId] });
    },
  });

  const handleSend = useCallback(() => {
    if (inputText.trim().length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMutation.mutate(inputText.trim());
    setInputText("");
  }, [inputText, sendMutation]);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isSent = item.sender_id === currentUserId;
      const prevMsg = messages?.[index + 1]; // inverted list
      const showAvatar = !isSent && prevMsg?.sender_id !== item.sender_id;

      return (
        <MessageBubble
          content={item.content}
          isSent={isSent}
          showAvatar={showAvatar}
          isRead={item.read_at !== null}
          timestamp={item.created_at}
        />
      );
    },
    [currentUserId, messages],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-4">
        {Array.from({ length: 5 }, (_, i) => (
          <View key={i} className={`mb-3 flex-row ${i % 2 === 0 ? "" : "justify-end"}`}>
            <Skeleton width={200} height={40} className="rounded-2xl" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ref={flatListRef}
        data={[...(messages ?? [])].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input bar */}
      <View
        className="flex-row items-end border-t border-neutral-200 bg-white px-3 pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <TextInput
          className="max-h-24 min-h-[40px] flex-1 rounded-full bg-neutral-50 px-4 py-2 text-base text-text"
          placeholder="Type a message..."
          placeholderTextColor="#B8B4AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <Pressable
          onPress={handleSend}
          disabled={inputText.trim().length === 0}
          className={`ml-2 mb-0.5 h-10 w-10 items-center justify-center rounded-full ${
            inputText.trim().length > 0 ? "bg-primary" : "bg-neutral-200"
          }`}
        >
          <Send
            size={18}
            color={inputText.trim().length > 0 ? "#fff" : "#B8B4AF"}
          />
        </Pressable>
      </View>
    </View>
  );
}
```

**Step 6: Verify**

Navigate to: Listing detail → "Message Seller" → conversation. Type and send a message. Auto-reply appears after 1-2s. Navigate back to inbox — thread list with avatars, previews, timestamps, unread dots.

**Step 7: Commit**

```bash
git add apps/mobile/components/messages/ apps/mobile/hooks/useThreads.ts apps/mobile/app/messages/
git commit -m "feat: messaging inbox with thread list and real-time conversation with auto-reply"
```

---

## Task 7: Community — Tabs, Discussions, Group Detail (Journey 5)

**Files:**
- Modify: `apps/mobile/app/(tabs)/community.tsx` — tabbed layout with Groups/Discussions/Events
- Modify: `apps/mobile/app/group/[id].tsx` — full group detail
- Modify: `apps/mobile/components/community/PostCard.tsx` — enhanced with reactions
- Modify: `apps/mobile/components/community/GroupCard.tsx` — add join button
- Create: `apps/mobile/components/community/EventCard.tsx`
- Create: `apps/mobile/hooks/useGroupDetail.ts`

Follow the same patterns from Tasks 3-6. Implement:

- **Community tab**: `@rn-primitives/tabs` with 3 sub-tabs (Groups, Discussions, Events). Groups tab shows "Your Groups" horizontal scroll + "Discover" vertical list with Join button (spring toggle). Discussions tab shows aggregated PostCard feed with reactions (tap → popover with 4 emoji). Events tab shows day strip + event cards.
- **PostCard enhanced**: author avatar + name + timestamp, content (expandable), reaction row with counts, reply count. Tap → inline expand with threaded replies.
- **GroupCard enhanced**: join/leave button with spring animation and haptic feedback.
- **Group detail** (`group/[id].tsx`): header with name/description/member count, member avatar row, post feed, coral FAB for compose.
- **EventCard**: title, group name, address, date/time, attendee avatar stack.

Each component follows the established patterns: NativeWind styling, `useServices()` for data, `useQuery` hooks, Reanimated springs for interactions, haptic feedback on actions.

**Verification:** Navigate to Community tab → switch between Groups/Discussions/Events. Tap a group → group detail with posts. Tap join → button toggles with animation.

**Commit:**

```bash
git commit -m "feat: community tab with groups, discussions, events, and group detail"
```

---

## Task 8: Auth — Sign In, Sign Up, Onboarding (Journey 6)

**Files:**
- Modify: `apps/mobile/app/auth/sign-in.tsx` — full sign-in screen
- Modify: `apps/mobile/app/auth/sign-up.tsx` — full sign-up screen
- Modify: `apps/mobile/app/onboarding/index.tsx` — swipeable 4-page onboarding

Follow established patterns. Implement:

- **Sign In**: Logo + tagline, email/password inputs (using `Input` component), "Sign In" `Button`, separator, Apple + Google buttons (show toast "Coming soon" in mock mode), link to sign-up. Error states with shake animation (Reanimated).
- **Sign Up**: Display name, email, password, confirm password. Password strength `@rn-primitives/progress` bar. Link to sign-in.
- **Onboarding**: Horizontal FlatList with snap. 4 pages: Location (map placeholder + neighborhood input), Kids (age range ChipGroup), Interests (CategoryGrid multi-select), First Listing (CTA or skip). Dot indicators. Skip on every page.

In mock mode, auth actions navigate directly (no real authentication). Mock auto-login is already handled by `MockInitializer` in `_layout.tsx`.

**Verification:** Navigate to auth/sign-in → fill form → tap "Sign In" → navigates to home. Navigate to auth/sign-up → fill form → navigates to onboarding → swipe through 4 pages.

**Commit:**

```bash
git commit -m "feat: auth screens with sign-in, sign-up, and 4-page onboarding flow"
```

---

## Task 9: Profile Screen (Journey 7)

**Files:**
- Modify: `apps/mobile/app/profile/[id].tsx` — full profile screen
- Create: `apps/mobile/components/profile/ReviewCard.tsx`
- Create: `apps/mobile/components/profile/StatsRow.tsx`
- Create: `apps/mobile/components/listings/ListingCardCompact.tsx`
- Create: `apps/mobile/hooks/useProfile.ts`

Follow established patterns. Implement:

- **Profile screen**: Large avatar with `@rn-primitives/avatar` (initials fallback), display name, neighborhood, member since, rating summary. StatsRow (3 columns: listings, transactions, groups). 2-column grid of ListingCardCompact. Reviews section using `@rn-primitives/accordion` with ReviewCard items.
- **ListingCardCompact**: Smaller variant of ListingCard for grid display — square image, title, price badge.
- **ReviewCard**: Reviewer avatar, thumbs up/down icon, comment text, date.
- **StatsRow**: Three equal columns with number + label.
- **useProfile hook**: fetches profile by ID from mock data.

If viewing own profile (ID matches current user), show "Edit Profile" button in header and status badges on listings.

**Verification:** Tap any seller avatar throughout the app → profile screen with avatar, stats, listing grid, and expandable reviews section.

**Commit:**

```bash
git commit -m "feat: profile screen with stats, listing grid, and reviews accordion"
```

---

## Task 10: Animation & Haptics Polish Pass

**Files:**
- Modify: `apps/mobile/components/listings/ListingCard.tsx` — add press animation
- Modify: `apps/mobile/components/common/FAB.tsx` — add spring + shadow animation
- Modify: `apps/mobile/app/(tabs)/index.tsx` — add custom pull-to-refresh
- Create: `apps/mobile/components/ui/AnimatedPressable.tsx` — reusable press animation wrapper
- Modify: Various screens — add `expo-haptics` calls where missing

This is the C-tier polish pass. Implement:

- **AnimatedPressable**: Reusable wrapper that adds scale 0.97 spring on press to any Pressable. Drop-in replacement.
- **ListingCard**: Wrap in AnimatedPressable (scale 0.98 + shadow reduction on press).
- **FAB**: Scale 0.9 → 1.0 spring on press, shadow elevation change, haptic on press.
- **Tab switch**: Crossfade content with 200ms timing.
- **Pull-to-refresh**: Custom spring arrow indicator on home feed.
- **Image loading**: Blur placeholder → sharp fade-in on ListingCard images and ImageCarousel.
- **Haptics audit**: Ensure `Haptics.impactAsync(Light)` on: tab switch, FAB press, send message, reaction select, chip toggle, photo reorder. `Haptics.impactAsync(Medium)` on: "Post Listing" success, offer sent.

**Verification:** Navigate through entire app. Every pressable has subtle scale animation. FAB bounces. Messages slide in. Haptic feedback on all interactions. No spinners — only skeleton loaders.

**Commit:**

```bash
git commit -m "feat: animation polish pass — spring interactions, haptics, skeleton loading"
```

---

## Task 11: Final Verification

**No new files.** Run through all 7 journeys and fix any issues.

**Step 1: Full journey walkthrough**

1. **Browse → Detail**: Home → scroll feed → tap listing → image carousel, price, seller, description, details, map, action bar
2. **Search**: Search tab → type query → results appear → tap filters → condition/age/sort chips → apply → filtered results → tap result → detail
3. **List item**: FAB → photos → details → pricing → review → "Post Listing" → success
4. **Message**: Detail → "Message Seller" → conversation → send message → auto-reply appears → back to inbox → thread visible
5. **Community**: Community tab → Groups/Discussions/Events tabs → tap group → group detail with posts → join group animation
6. **Auth**: Sign-in → sign-up → onboarding swipe → completes
7. **Profile**: Tap seller avatar → profile with stats, listings grid, reviews

**Step 2: Visual audit**

- All screens use design tokens (sage green #6B8F71, coral #E8836B, background #F7F5F3)
- Card radii are 12px everywhere
- Button radii are 8px everywhere
- Spacing follows 4px grid
- No raw spinners — only animated skeletons
- Empty states on all list screens
- Pull-to-refresh on feeds

**Step 3: Interaction audit**

- All pressables have spring scale animation
- Haptic feedback fires on all touch targets
- Keyboard dismisses properly on all forms
- Bottom sheets open/close smoothly
- Tab navigation works with proper active states

**Step 4: Fix any issues found**

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: final verification — all 7 journeys working end-to-end"
```

---

## Summary

| Task | Description | New Files | Modified Files |
|------|-------------|-----------|----------------|
| 1 | Dependencies + core design components | 8 | 1 |
| 2 | Extended fixtures + mock services + search store | 3 | 5 |
| 3 | Listing Detail (Journey 1) | 4 | 2 |
| 4 | Search Tab with filters (Journey 2) | 4 | 2 |
| 5 | Create Listing flow (Journey 3) | 3 | 1 |
| 6 | Messaging inbox + conversation (Journey 4) | 3 | 2 |
| 7 | Community tabs + group detail (Journey 5) | 2 | 4 |
| 8 | Auth + onboarding (Journey 6) | 0 | 3 |
| 9 | Profile screen (Journey 7) | 4 | 1 |
| 10 | Animation & haptics polish | 1 | 5+ |
| 11 | Final verification | 0 | 0 |
| **Total** | | **~32 new** | **~26 modified** |

**11 tasks. ~58 files touched. 11 commits. All 7 user journeys working end-to-end with pixel-perfect polish.**

# GooGoo Full UI Implementation Design

**Date:** 2026-04-03
**Status:** Approved
**Scope:** Implement all screens with real UI, mock data, pixel-perfect polish, and full user journey navigation.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component primitives | `@rn-primitives` | Headless, accessible, composable — same philosophy as Ariakit but works with React Native + NativeWind. |
| Polish level | Pixel-perfect (C-tier) | Shared element transitions, spring animations, haptics, optimistic UI, gesture polish. Demo-day ready. |
| Scope | All 7 user journeys | Browse, search, list, message, community, auth, profile — complete app experience. |
| Data | Mock mode via existing fixtures | Faker-based factories + scenarios already exist. All screens render mock data by default. |
| Styling | NativeWind v4 + `@googoo/ui` tokens | Already set up. Design components wrap primitives with token-based classes. |

---

## Component Architecture

Three layers, strictly separated:

### Layer 1: Primitives (`@rn-primitives/*`)

Headless accessible components. Zero styling. Install these packages:

- `@rn-primitives/avatar` — profile images with initials fallback
- `@rn-primitives/select` — category picker, condition picker, sort
- `@rn-primitives/tabs` — community sub-tabs, profile sections
- `@rn-primitives/accordion` — expandable reviews, description text
- `@rn-primitives/alert-dialog` — discard confirmation, delete listing
- `@rn-primitives/dialog` — modal overlays
- `@rn-primitives/popover` — reaction picker
- `@rn-primitives/separator` — section dividers
- `@rn-primitives/toggle` — password show/hide, shipping toggle
- `@rn-primitives/toggle-group` — multi-select chips (condition, age range)
- `@rn-primitives/progress` — password strength, step indicator
- `@rn-primitives/tooltip` — info hints

### Layer 2: Design Components (`components/ui/`)

Styled wrappers around primitives using NativeWind + `@googoo/ui` tokens:

| Component | Wraps | Key Props |
|-----------|-------|-----------|
| `Button` | Pressable | `variant: "primary" \| "secondary" \| "ghost"`, `loading`, `size` |
| `Card` | Pressable | `shadow`, `pressable` |
| `Input` | TextInput | `label`, `error`, `helperText`, `leftIcon`, `rightIcon` |
| `TextArea` | TextInput (multiline) | `label`, `maxLength`, `showCount` |
| `Select` | `@rn-primitives/select` | `label`, `options`, `placeholder` |
| `BottomSheet` | `@gorhom/bottom-sheet` | `snapPoints`, `title` |
| `Dialog` | `@rn-primitives/alert-dialog` | `title`, `description`, `confirmLabel`, `cancelLabel` |
| `Badge` | View + Text | `variant: "price" \| "swap" \| "free" \| "condition" \| "distance"` |
| `Avatar` | `@rn-primitives/avatar` | `uri`, `fallback` (initials), `size` |
| `Tabs` | `@rn-primitives/tabs` | `items`, `defaultValue` |
| `Chip` | Pressable | `label`, `selected`, `onToggle`, `dismissible` |
| `ChipGroup` | View + Chip[] | `options`, `selected`, `multiple` |
| `ImageCarousel` | FlatList + Reanimated | `images`, `showDots`, `pinchToZoom` |
| `Skeleton` | Reanimated View | `width`, `height`, `rounded`, shimmer animation |
| `EmptyState` | View | `icon`, `title`, `description`, `action` |
| `StickyBottomBar` | View | `children`, safe area insets |

### Layer 3: Domain Components

Composed from Layer 2, typed against `@googoo/shared`:

| Component | Used In | Description |
|-----------|---------|-------------|
| `ListingCard` | Home feed, search results, profile | Hero image, price badge, distance, seller avatar |
| `ListingCardCompact` | Profile grid, search compact mode | 2-column grid variant |
| `ListingDetail` | listing/[id] | Full listing view with all sections |
| `PostCard` | Community discussions, group feed | Author, content, reactions, reply count |
| `GroupCard` | Community groups tab | Name, member count, join button |
| `ThreadRow` | Inbox | Avatar, preview, timestamp, unread dot |
| `MessageBubble` | Conversation | Sent/received variants, read receipt |
| `OfferBubble` | Conversation | Special card with amount, accept/decline |
| `ReviewCard` | Profile | Reviewer, thumbs up/down, comment |
| `CategoryCard` | Search default state | Icon + label, pressable |
| `MemberAvatarRow` | Group detail | Horizontal avatar stack with "+N more" |

---

## User Journeys — Screen Specifications

### Journey 1: Browse → Detail

#### Home Feed (`(tabs)/index.tsx`)

**Layout:**
- Pull-to-refresh with spring animation
- Distance tier section headers ("Nearby", "Within 5 mi", "Within 10 mi") — sticky
- FlatList of ListingCard components
- Skeleton loader grid while loading (shimmer animation, never spinners)
- FAB bottom-right, above tab bar, coral accent

**ListingCard anatomy:**
- Hero image (3:2 aspect ratio)
- Price badge (top-right overlay) — "$25" green, "Swap" coral, "Free" outlined
- Title (1 line, truncated)
- Distance pill + seller avatar + seller first name (bottom row)
- Press: scale 0.98 spring → navigate to listing/[id]

**Data:** `useNearbyListings` hook → mock `fetchNearbyListings` → grouped by distance tiers.

#### Listing Detail (`listing/[id].tsx`)

**Sections (top to bottom):**

1. **Image carousel** — horizontal FlatList with snap, dot indicators, pinch-to-zoom. Shared element transition from ListingCard hero image.

2. **Price/type bar** — large price text or Swap/Free badge. Condition badge. Age range badge. All using `Badge` component.

3. **Seller row** — `Avatar` + display name + neighborhood + rating (thumbs up %). Pressable → `profile/[id]`.

4. **Description** — `@rn-primitives/accordion` for expand/collapse if > 3 lines. "Read more" trigger.

5. **Details grid** — 2x2 grid: category, condition, ships (yes/no icon), posted date.

6. **Map preview** — static map thumbnail showing approximate location. Pressable → opens native Maps.

7. **Bottom sticky bar** — `StickyBottomBar` with:
   - "Message Seller" (primary Button) → creates/opens thread in `messages/[threadId]`
   - "Make an Offer" (secondary Button) → BottomSheet with price input
   - For swap listings: "Propose Swap" instead of "Make an Offer"

**Data:** `useQuery(["listing", id])` → mock `fetchListingById`. Seller profile fetched separately.

---

### Journey 2: Search → Browse

#### Search Tab (`(tabs)/search.tsx`)

**Default state (no query):**
- Search bar (auto-focus on tab press), with search icon left, clear button right
- Recent searches as dismissible `Chip` components (persisted in Zustand store)
- Category grid — 2x4 grid of `CategoryCard` components

**Active search state:**
- Autocomplete suggestions in a dropdown (keyword match against mock listing titles)
- Results: FlatList of ListingCard, same component as home feed
- Filter pill bar below search — active filters as removable `Chip` components, filter count badge

**Filter BottomSheet:**
- Distance: slider 1–50 mi + "Include shipping" Toggle
- Price: range inputs + "Free" / "Swap only" quick Chips
- Condition: `ChipGroup` (multiple select) — New with tags, Like new, Good, Fair
- Age range: `ChipGroup` (multiple select)
- Sort: radio group via `@rn-primitives/toggle-group` (exclusive) — Distance, Price low-high, Price high-low, Newest
- "Apply" (primary Button) + "Reset" (ghost Button)

**Results state:**
- Count header: "24 items near Tacoma"
- Infinite scroll via `useInfiniteQuery` + `onEndReached`
- `EmptyState` when no results: "No items found. Try adjusting your filters."

**Data:** `useSearchListings(query, filters)` hook → mock `searchListings`.

---

### Journey 3: List an Item

#### Create Listing (`listing/create.tsx`)

Multi-step form. `react-hook-form` + `createListingSchema` from `@googoo/shared`.

**Step indicator:** horizontal dots at top, animated fill (Reanimated). Current step label below.

**Step 1: Photos**
- 5-slot grid (first slot 2x size). Empty slots: dashed border + camera icon.
- Tap → `expo-image-picker` choice (camera/gallery) via `Dialog`
- Drag to reorder via `react-native-gesture-handler`
- Client-side compression: 800px max width, 80% JPEG
- "Next" enabled when >= 1 photo

**Step 2: Details**
- Title `Input` (required, 3-100 chars, live character count)
- Category `Select` → BottomSheet with 8 categories
- Condition: 4 radio-style `Card` components (visual, not a dropdown)
- Age range: optional `ChipGroup`
- Description `TextArea` (optional, max 2000 chars)

**Step 3: Pricing**
- Three large tappable Cards: "Sell" / "Swap" / "Free"
- Sell selected → price `Input` with "$" prefix, numeric keyboard
- Swap selected → "What do you want?" `TextArea`
- "Include shipping" `Toggle` with helper text

**Step 4: Review & Post**
- Full preview using ListingCard + detail section components
- Edit buttons per section → jump back to that step
- "Post Listing" (primary Button, coral, full width, spring scale)
- Success: confetti animation, "Your listing is live!" with "View Listing" + "List Another" buttons

**Navigation:** swipe-back returns to previous step. Unsaved changes → `Dialog` confirmation.

---

### Journey 4: Messaging

#### Inbox (`messages/index.tsx`)

- Two sections via `@rn-primitives/separator`: "Transactions" and "Social"
- FlatList of `ThreadRow` components, sorted by most recent
- ThreadRow: avatar, name, last message preview (truncated), relative timestamp, unread dot (coral)
- Transaction threads show listing thumbnail on right (tappable → listing detail)
- Swipe-to-archive gesture
- `EmptyState`: "No messages yet. Browse listings and start a conversation!"

#### Conversation (`messages/[threadId].tsx`)

- **Listing context card** (pinned top) — compact listing card if thread linked to listing. Tappable.
- **Message list** — inverted FlatList. Grouped by date with separators.
  - Sent: right-aligned, coral-tinted `MessageBubble`
  - Received: left-aligned, neutral `MessageBubble` with avatar
  - Read receipt: subtle "Read" under last sent message
- **Typing indicator** — three-dot bounce animation (Reanimated). Random mock trigger.
- **Input bar** — sticky bottom. Auto-grow TextInput (up to 4 lines). Send button with spring scale. Disabled when empty.
- **Make an Offer** — chip above input (for sell listings). Opens price BottomSheet. Renders as `OfferBubble` with amount + accept/decline.
- **Mock auto-reply** — 1-2 second delay after sending, mock reply appears to simulate conversation.

**Data:** `useMessages(threadId)` hook. Optimistic send via `useMutation` with `onMutate` cache update.

---

### Journey 5: Community

#### Community Tab (`(tabs)/community.tsx`)

Three sub-tabs via `@rn-primitives/tabs`: Groups | Discussions | Events

**Groups tab:**
- "Your Groups" — horizontal FlatList of joined `GroupCard` components
- "Discover Groups" — vertical FlatList. Geographic groups first (with distance pill), interest-based below. Join button with spring toggle → "Joined" checkmark.

**Discussions tab:**
- Aggregated post feed across joined groups
- `PostCard`: group label, author avatar + name + timestamp, content (expandable), optional images (horizontal scroll), reply count, reaction summary
- Reactions: tap → `@rn-primitives/popover` with 4 emoji options. Animated scale on select.
- Tap post → inline expand with threaded replies (indented, vertical thread line). Reply input at bottom.

**Events tab:**
- Day strip at top (horizontal scroll, current day coral-highlighted)
- Event cards: title, group name, location, date/time, attendee avatar stack
- `EmptyState`: "No upcoming events"

#### Group Detail (`group/[id].tsx`)

- Header: name, description, member count, "Leave" ghost Button
- `MemberAvatarRow` — first 10 avatars + "+N more"
- Post feed (PostCard filtered to this group)
- Coral FAB → post creation BottomSheet (text + optional image)

---

### Journey 6: Auth

#### Sign In (`auth/sign-in.tsx`)

- Logo + tagline centered top
- Email `Input` + password `Input` (with show/hide `Toggle` icon)
- "Sign In" primary `Button` (full width)
- `Separator` with "or" text
- Apple Sign-In button (dark) + Google button (outlined) — toast "Coming soon" on tap
- "Don't have an account? Sign Up" link → `sign-up`
- Error: inline validation, shake animation on failed submit

#### Sign Up (`auth/sign-up.tsx`)

- Display name + email + password + confirm password inputs
- Password strength `Progress` bar (animated color shift)
- "Create Account" → navigates to onboarding
- "Already have an account? Sign In" link

#### Onboarding (`onboarding/index.tsx`)

Swipeable horizontal FlatList with snap:

1. **Location** — "Where are you?" Map with draggable pin or neighborhood text input. Pre-permission modal.
2. **Kids** — "How old are your little ones?" Age range `ChipGroup`, multi-select. Skip option.
3. **Interests** — "What are you looking for?" Category grid, multi-select.
4. **First Listing** — "Got something to list?" Quick-list CTA or "Skip for now."

Dot indicators, animated. "Skip" on every page.

---

### Journey 7: Profile

#### Profile (`profile/[id].tsx`)

- **Header**: large `Avatar` (initials fallback), display name, neighborhood, member since, rating (thumbs up count + %)
- **Stats row**: 3 columns — listings count, transactions, groups joined
- **Listings grid**: 2-column grid of `ListingCardCompact`. `EmptyState` if none.
- **Reviews section**: `@rn-primitives/accordion` — expandable. `ReviewCard` for each: reviewer avatar, thumbs icon, comment, date.
- **Own profile**: "Edit Profile" button in header, status badges on listings (active/sold/swapped)

---

## Animation & Polish Specification

### Shared Element Transitions
- ListingCard hero → Listing Detail carousel (Reanimated layout animation)
- Avatar tap → Profile avatar (scale + position)

### Micro-interactions (all Reanimated spring, damping: 15)
| Element | Animation |
|---------|-----------|
| FAB | Scale 0.9 → 1.0 on press, shadow elevation change |
| Buttons | Scale 0.97 press-in, 1.0 press-out |
| ListingCard | Scale 0.98 on press, shadow reduction |
| Tab switch | Crossfade 200ms spring |
| Chip select | Scale pop 1.0 → 1.1 → 1.0 with color fill |
| Send message | Bubble slides up from bottom + opacity fade |
| Pull-to-refresh | Custom spring arrow animation |

### Loading States
- Skeleton screens everywhere with shimmer (Reanimated interpolated opacity)
- Optimistic updates on: send message, post listing, join group, react to post
- Image loading: blur placeholder → sharp fade-in

### Haptics (`expo-haptics`)
- Light impact: tab switch, FAB press, send message, reaction select, photo reorder
- Medium impact: "Post Listing" success, offer sent

### Gestures
- Swipe-back on all stack screens
- Swipe-to-archive in inbox
- Drag-to-reorder photos in create listing
- Pinch-to-zoom on listing detail images

---

## New Dependencies

Add to `apps/mobile/package.json`:

```
@rn-primitives/avatar
@rn-primitives/select
@rn-primitives/tabs
@rn-primitives/accordion
@rn-primitives/alert-dialog
@rn-primitives/dialog
@rn-primitives/popover
@rn-primitives/separator
@rn-primitives/toggle
@rn-primitives/toggle-group
@rn-primitives/progress
@rn-primitives/tooltip
expo-haptics
```

---

## Data Flow

All screens consume mock data through the existing service layer:

```
Screen → Hook (useQuery/useMutation) → Service (mock/) → Fixtures (factories + scenarios)
```

- Mock mode is already wired via `EXPO_PUBLIC_USE_MOCKS=true`
- Factories in `fixtures/factories.ts` generate all domain types
- Scenarios in `fixtures/scenarios.ts` provide consistent seed data
- New fixtures needed: threads/conversations, events, reviews, search results
- Mock auto-reply in conversations: `setTimeout` with 1-2s random delay

No backend changes needed. Everything runs client-side with mock data.

---

## File Impact Summary

| Directory | New Files | Modified Files |
|-----------|-----------|----------------|
| `components/ui/` | ~16 | 0 |
| `components/listings/` | 2 | 1 (ListingCard) |
| `components/community/` | 2 | 2 (GroupCard, PostCard) |
| `components/messages/` | 4 | 0 |
| `components/profile/` | 2 | 0 |
| `app/(tabs)/` | 0 | 3 (index, search, community) |
| `app/listing/` | 0 | 2 ([id], create) |
| `app/auth/` | 0 | 2 (sign-in, sign-up) |
| `app/onboarding/` | 0 | 1 |
| `app/messages/` | 0 | 2 (index, [threadId]) |
| `app/group/` | 0 | 1 |
| `app/profile/` | 0 | 1 |
| `hooks/` | 3 | 2 |
| `services/mock/` | 2 | 3 |
| `fixtures/` | 2 | 1 |
| `stores/` | 1 | 0 |
| **Total** | **~34 new** | **~21 modified** |

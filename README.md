# NestSwap — Product Brief & Technical Specification

**Version:** 0.1.0
**Date:** April 2026
**Status:** Pre-development

---

## 1. Product Vision

NestSwap is a mobile-first marketplace where new parents buy, sell, and swap children's items — and find community while doing it. Kids outgrow things fast. Parents accumulate gear they no longer need and need gear they can't justify buying new. NestSwap closes that loop with a hyper-local-first approach: show me what's nearby, let me swap or buy it, and connect me with the parent behind the listing.

**Core insight:** Parenting marketplaces fail when they're just "Craigslist for baby stuff." Parents want to transact with *other parents* — people they can trust, relate to, and potentially befriend. The social layer isn't a nice-to-have; it's the moat.

---

## 2. Target Users

**Primary:** Parents of children ages 0–6 (the high-turnover years).
**Secondary:** Expecting parents building their first set of gear.
**Tertiary:** Grandparents, family members shopping for kids.

**Persona — "First-time parent, 8-month-old":**
- Drowning in outgrown 0–3 month clothes
- Needs a convertible car seat but doesn't want to pay $350 new
- Would love to know other parents in the neighborhood
- Has ~15 minutes of free time in unpredictable bursts (the app must be fast)

---

## 3. Information Architecture

### 3.1 Tab Structure (Bottom Navigation, 3 Tabs)

```
┌─────────────────────────────────────────────────┐
│                   App Content                   │
│                                                 │
├────────────┬────────────────┬────────────────────┤
│   🏠 Home  │   🔍 Search    │   👥 Community     │
└────────────┴────────────────┴────────────────────┘
```

### 3.2 Tab Definitions

#### Tab 1: Home (Feed)

The default landing screen. A vertically scrolling feed combining:

1. **Nearby listings** — Items available within the user's proximity radius (default: 10 miles, adjustable). Sorted by recency + distance blend.
2. **Swap matches** — If the user has active listings, surface other users whose "want" matches the user's "have" (and vice versa). This is the magic moment.
3. **Community highlights** — Pinned posts from local parent groups, upcoming meetups, or popular discussion threads (pulled from the Community tab to cross-pollinate engagement).
4. **Shipping picks** — A secondary section ("From farther away") showing high-quality listings available via shipping, personalized by the user's browsing/category history.

**Key UI decisions:**
- Card-based layout. Each listing card: hero image, title, price (or "Swap" / "Free" badge), distance, seller avatar + first name.
- Pull-to-refresh. Infinite scroll with skeleton loading.
- No algorithmic ranking at launch. Reverse-chronological within distance tiers (0–2 mi, 2–5 mi, 5–10 mi, 10+ mi shipping). Algorithm comes later with data.

#### Tab 2: Search

Full-catalog search and browse. Two modes:

1. **Search bar** (top, always visible) — Full-text search across listing titles, descriptions, and tags. Autocomplete powered by recent + popular queries.
2. **Category grid** — Below the search bar, a grid of curated categories:
   - Clothing (with age/size sub-filters)
   - Gear & Equipment (strollers, car seats, high chairs)
   - Toys & Books
   - Nursery & Furniture
   - Feeding & Nursing
   - Bath & Diapering
   - Maternity
   - Other / Miscellaneous

**Filters (slide-up panel):**
- Distance (slider: 1–50 miles, or "Include shipping")
- Price range (including "Free" and "Swap only")
- Condition (New with tags / Like new / Good / Fair)
- Age range (Newborn, 0–3mo, 3–6mo, 6–12mo, 1–2yr, 2–4yr, 4–6yr)
- Sort by: Distance / Price low-high / Price high-low / Newest

**Key UI decisions:**
- Map view toggle. Users can switch between list view and a map view showing pins for listings. Map is not the default (list is faster to scan) but is one tap away.
- Recent searches persisted locally.
- "Save search" with push notification when new matches appear.

#### Tab 3: Community (Social)

The social hub. This is what makes NestSwap sticky beyond transactions.

1. **Local Groups** — Auto-joined based on geography (e.g., "Tacoma Parents," "South Sound Families"). Users can also join interest-based groups ("Cloth Diapering," "Montessori at Home," "Twin Parents").
2. **Discussion Feed** — Posts within groups. Text + optional image. Threaded replies. Reactions (👍 ❤️ 😂 — keep it simple, max 3–4 reactions).
3. **Events** — Local meetups, swap events, playgroups. Created by any user. Shows on a mini-calendar and map.
4. **Direct Messages** — Unified inbox for both transaction conversations (initiated from a listing) and social DMs. Transaction threads show the listing card inline for context.

**Key UI decisions:**
- DMs live in Community tab, not behind a separate icon. Conversations are the social layer.
- Group discovery via a "Find Groups" search within the tab.
- No public profiles at launch — your profile is your listings + your group memberships + a short bio. Keep it lightweight.

### 3.3 Cross-Cutting Features (Not Tab-Specific)

- **Listing creation (FAB / "+" button):** Always-visible floating action button. Guides user through: photo(s) → title → category → condition → price/swap/free → description → ship or local only. Target: < 60 seconds to list.
- **User profiles:** Avatar, display name, neighborhood (not exact address), member since, ratings, active listings. Accessible by tapping any avatar.
- **Ratings & trust:** After a completed transaction, both parties rate. Simple thumbs up/down + optional short text. No 5-star scale (too noisy for P2P).
- **Notifications:** Push notifications for: messages, swap match alerts, saved search matches, transaction updates, group activity (configurable).
- **Onboarding:** Location permission → age(s) of kid(s) → what are you looking for? → what do you have to list? (optional quick-list flow). Target: < 90 seconds to first feed view.

---

## 4. Transaction Model

### 4.1 Transaction Types

| Type | Description | Payment |
|------|-------------|---------|
| **Buy** | Seller sets a price, buyer pays | In-app payment (Stripe) |
| **Swap** | Seller marks item as "Open to swap" and lists what they want | No payment; both confirm |
| **Free** | Seller gives item away | No payment |
| **Make an Offer** | Buyer proposes a price on any priced listing | In-app payment if accepted |

### 4.2 Fulfillment

- **Local pickup** (default): Buyer and seller coordinate via DM. App suggests public meeting spots (parks, library parking lots, fire stations) near the midpoint. Safety-conscious defaults.
- **Shipping**: Seller opts in at listing time. Buyer pays shipping. App generates a prepaid label (USPS/UPS integration via EasyPost or Shippo). Flat-rate shipping tiers by size category to keep it simple.

### 4.3 Payments & Fees

- Stripe Connect for payouts.
- **Fee structure (opinionated):** 0% seller fee. 5% buyer service fee on purchases. Free items and swaps have no fee. This keeps the supply side frictionless — the hardest part of a marketplace is getting inventory.
- Stripe handles PCI compliance. No stored card numbers on our side.

---

## 5. Technical Specification

### 5.1 Architecture Decision: React Native (Expo)

**Choice: React Native with Expo (SDK 52+), managed workflow.**

Rationale:
- Single codebase → iOS, Android, and web (via `expo-router` + `react-native-web`).
- Expo's managed workflow eliminates native build toolchain pain for a small team.
- `expo-router` provides file-system-based routing that works across all three platforms.
- Access to native APIs (camera, location, push notifications) via Expo modules.
- OTA updates via EAS Update — ship fixes without App Store review.

**Rejected alternatives:**
- Flutter: Strong cross-platform story but Dart ecosystem is thinner for marketplace infra (payments, search). Harder to hire for.
- Native (Swift + Kotlin): Two codebases. Not viable for a small team.
- PWA-only: Insufficient for push notifications on iOS, no App Store presence, weaker offline support.

### 5.2 Monorepo Structure

```
nestswap/
├── apps/
│   └── mobile/                    # Expo app (iOS, Android, Web)
│       ├── app/                   # expo-router file-based routes
│       │   ├── (tabs)/            # Tab layout group
│       │   │   ├── index.tsx      # Home feed
│       │   │   ├── search.tsx     # Search tab
│       │   │   └── community.tsx  # Community tab
│       │   ├── listing/
│       │   │   ├── [id].tsx       # Listing detail
│       │   │   └── create.tsx     # Create listing flow
│       │   ├── profile/
│       │   │   └── [id].tsx       # User profile
│       │   ├── messages/
│       │   │   ├── index.tsx      # Inbox
│       │   │   └── [threadId].tsx # Conversation
│       │   ├── group/
│       │   │   └── [id].tsx       # Group detail / feed
│       │   └── _layout.tsx        # Root layout
│       ├── components/            # Shared UI components
│       ├── hooks/                 # Custom React hooks
│       ├── services/              # API client, auth, storage
│       ├── constants/             # Theme, config, categories
│       ├── types/                 # TypeScript type definitions
│       ├── app.json               # Expo config
│       └── package.json
├── packages/
│   └── shared/                    # Shared types, validation, utils
│       ├── src/
│       │   ├── types.ts           # Domain types (Listing, User, etc.)
│       │   ├── validation.ts      # Zod schemas (shared client + server)
│       │   └── utils.ts           # Pure utility functions
│       └── package.json
├── supabase/
│   ├── migrations/                # SQL migrations
│   ├── functions/                 # Supabase Edge Functions (Deno)
│   │   ├── create-listing/
│   │   ├── create-checkout/
│   │   ├── generate-shipping-label/
│   │   ├── notify-swap-match/
│   │   └── send-push-notification/
│   ├── seed.sql                   # Dev seed data
│   └── config.toml
├── turbo.json                     # Turborepo config
├── package.json                   # Root workspace config
└── README.md
```

**Monorepo tooling: Turborepo** — simple, fast, works with npm/pnpm workspaces. No Nx overhead.

### 5.3 Backend: Supabase

**Choice: Supabase (hosted PostgreSQL + Auth + Realtime + Edge Functions + Storage).**

Rationale:
- PostgreSQL gives us PostGIS for geospatial queries (proximity search is a first-class citizen).
- Supabase Auth handles email/password, Google, Apple sign-in out of the box.
- Supabase Realtime powers live chat (DMs) via Postgres changes + broadcast channels.
- Supabase Storage for listing images (with built-in CDN + image transforms for thumbnails).
- Edge Functions (Deno-based) for server-side logic: payment webhooks, shipping label generation, swap matching, push notifications.
- Row Level Security (RLS) policies enforce data access at the database level — no middleware auth bugs.

**Rejected alternatives:**
- Firebase: Firestore's NoSQL model is a poor fit for relational marketplace data (listings ↔ users ↔ transactions ↔ messages). Geospatial queries require GeoFire hacks.
- Custom Node/Express + managed Postgres: More control, more ops burden. Supabase is the right abstraction for speed-to-market.

### 5.4 Data Model (PostgreSQL)

```sql
-- Core tables (simplified — full migrations in /supabase/migrations/)

-- Users extend Supabase auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS point
    neighborhood TEXT,                           -- Human-readable locality
    kid_ages TEXT[],                             -- e.g., ['6mo', '3yr']
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Spatial index for proximity queries
CREATE INDEX idx_profiles_location ON public.profiles USING GIST(location);

CREATE TYPE listing_status AS ENUM ('active', 'reserved', 'sold', 'swapped', 'removed');
CREATE TYPE listing_type AS ENUM ('sell', 'swap', 'free');
CREATE TYPE item_condition AS ENUM ('new_with_tags', 'like_new', 'good', 'fair');
CREATE TYPE age_range AS ENUM (
    'newborn', '0_3mo', '3_6mo', '6_12mo', '1_2yr', '2_4yr', '4_6yr'
);

CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    condition item_condition NOT NULL,
    age_range age_range,
    listing_type listing_type NOT NULL,
    price_cents INTEGER,                         -- NULL for swap/free
    swap_preferences TEXT,                       -- What they want in return
    images TEXT[] NOT NULL,                       -- Storage paths, first = hero
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    ships BOOLEAN DEFAULT FALSE,
    status listing_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listings_location ON public.listings USING GIST(location);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created ON public.listings(created_at DESC);

-- Full-text search index
ALTER TABLE public.listings ADD COLUMN fts tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
    ) STORED;
CREATE INDEX idx_listings_fts ON public.listings USING GIN(fts);

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    type listing_type NOT NULL,
    price_cents INTEGER,
    fee_cents INTEGER,
    stripe_payment_intent_id TEXT,
    shipping_label_url TEXT,
    tracking_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending',       -- pending, paid, shipped, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
    rating BOOLEAN NOT NULL,                     -- true = thumbs up, false = thumbs down
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(transaction_id, reviewer_id)
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    listing_id UUID REFERENCES public.listings(id),  -- NULL for social DMs
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_thread ON public.messages(thread_id, created_at DESC);

CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326),             -- NULL for interest-based groups
    radius_miles INTEGER,                        -- Geofence for auto-join suggestions
    is_geographic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',                  -- member, moderator, admin
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    images TEXT[],
    parent_id UUID REFERENCES public.posts(id),  -- NULL = top-level, set = reply
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id),
    creator_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    query TEXT,
    filters JSONB NOT NULL,                      -- Serialized filter state
    notify BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.5 Key Technical Decisions

#### Geospatial: PostGIS

Proximity is the core UX primitive. Every listing query is spatial:

```sql
-- Example: listings within 10 miles, sorted by distance
SELECT *, ST_Distance(location, ST_MakePoint(-122.44, 47.25)::geography) AS distance_m
FROM public.listings
WHERE status = 'active'
  AND ST_DWithin(location, ST_MakePoint(-122.44, 47.25)::geography, 16093)  -- 10 miles in meters
ORDER BY distance_m ASC, created_at DESC
LIMIT 20 OFFSET 0;
```

Client sends `{ lat, lng, radius_miles }` with every feed/search request. The Supabase client library supports `.rpc()` calls to custom Postgres functions wrapping these queries.

#### Search: Postgres Full-Text Search (to start)

At launch, `tsvector` + `GIN` index is sufficient. It supports stemming, ranking, and prefix matching. When search volume exceeds what Postgres handles comfortably (likely 100K+ listings), migrate to a dedicated search service (Typesense — open source, fast, easy to self-host, geo-aware).

#### Real-Time Messaging: Supabase Realtime

Subscribe to `INSERT` events on the `messages` table filtered by `thread_id`. Supabase Realtime uses WebSockets under the hood. Good enough for 1:1 DMs. If group chat volume gets heavy, evaluate dedicated solutions later.

#### Image Handling

- Upload to Supabase Storage via the client SDK.
- On upload, generate thumbnails via Supabase Image Transforms (URL-based: `?width=300&height=300`).
- Listing cards use thumbnails. Detail view loads full-res.
- Limit: 5 images per listing. First image = hero.
- Client-side compression before upload (`expo-image-manipulator`, target ~800px wide, 80% quality JPEG).

#### Push Notifications

- Expo Notifications (wraps APNs + FCM).
- Store push tokens in `profiles` table.
- Edge Function triggers on relevant DB events (new message, swap match, saved search match) → sends push via Expo's push API.

#### Authentication

- Supabase Auth with email/password + Apple Sign-In + Google Sign-In.
- Apple Sign-In is **required** by App Store policy if any social login is offered.
- Auth state managed client-side via `@supabase/auth-helpers-react`.
- JWT stored securely via `expo-secure-store` on native, `httpOnly` cookie on web.

### 5.6 Client-Side Stack

| Concern | Library | Why |
|---------|---------|-----|
| Framework | Expo SDK 52+ (React Native) | Cross-platform, managed workflow |
| Routing | `expo-router` v4+ | File-based, works on web, deep linking for free |
| State | `zustand` | Tiny, no boilerplate, works with React Native |
| Server state | `@tanstack/react-query` v5 | Caching, pagination, optimistic updates |
| Styling | `nativewind` v4 (Tailwind for RN) | Utility-first, consistent across platforms |
| Forms | `react-hook-form` + `zod` | Validation schemas shared with backend via `packages/shared` |
| Maps | `react-native-maps` (native) / Mapbox GL (web) | Listing map view, event locations, meetup spots |
| Camera/Gallery | `expo-image-picker` | Listing photo capture |
| Location | `expo-location` | User position for proximity |
| Payments | `@stripe/stripe-react-native` | In-app checkout |

### 5.7 API Design

No REST API layer at launch. Use the **Supabase client SDK directly** from the app for CRUD operations, with Row Level Security enforcing authorization. This eliminates an entire backend service.

**Edge Functions** handle operations that require server-side secrets or orchestration:
- `create-checkout` — Creates a Stripe PaymentIntent, returns client secret.
- `generate-shipping-label` — Calls Shippo/EasyPost API, stores label URL.
- `notify-swap-match` — Runs on listing insert, finds potential swaps, sends push.
- `send-push-notification` — Generic push sender invoked by DB triggers/webhooks.

Edge Functions are invoked via `supabase.functions.invoke('function-name', { body })`.

### 5.8 Swap Matching Algorithm (v1 — Simple)

When a user creates a listing with `listing_type = 'swap'`:

1. Query active listings within the user's radius where:
   - The other listing's `category` matches what this user wrote in `swap_preferences` (keyword match against title/description).
   - The other user's `swap_preferences` keyword-match this listing's category/title.
2. If mutual interest is detected, notify both users: "You might have a swap match!"
3. Users then DM to negotiate.

This is intentionally naive. Improve with embeddings / semantic matching later.

### 5.9 Web Support Notes

`react-native-web` (bundled with Expo for web) handles most components. Key platform-specific considerations:

- Use `Platform.select()` for components that differ (e.g., maps, secure storage).
- Web uses `localStorage` (via a thin wrapper) where native uses `expo-secure-store`.
- Web gets responsive layout via NativeWind breakpoints (`sm:`, `md:`, `lg:`).
- Web deployment: Vercel or Netlify (static export via `npx expo export -p web`).
- App Store: EAS Build for iOS and Android binaries.

---

## 6. Design System (Opinionated Defaults)

**Typography:** System fonts (`-apple-system`, `Roboto`). No custom fonts at launch — they slow cold start.

**Color palette:**
- Primary: Warm sage green (`#6B8F71`) — calming, gender-neutral, nature-adjacent.
- Accent: Soft coral (`#E8836B`) — warmth, energy, CTAs.
- Neutrals: Warm grays (`#F7F5F3` background, `#2D2D2D` text).
- Success / Error / Warning: Standard accessible palette.

**Spacing:** 4px base grid. Components snap to multiples of 4.

**Border radius:** 12px for cards, 8px for buttons, 20px for avatars (circular).

**Iconography:** Lucide icons (open source, consistent, available in React Native).

**Motion:** Minimal. Shared element transitions between listing card → detail. Spring-based animations via `react-native-reanimated` only where they improve comprehension (e.g., tab switching, modal presentation).

---

## 7. Launch Scope (MVP)

### In Scope (v1.0)

- [x] User registration + authentication (email, Apple, Google)
- [x] Onboarding flow (location, kid ages, interests)
- [x] Home feed with proximity-sorted listings
- [x] Create listing flow (photos, details, price/swap/free)
- [x] Search with filters + category browse
- [x] Listing detail view
- [x] Direct messaging (1:1, transaction-linked)
- [x] User profiles with ratings
- [x] Local pickup coordination
- [x] Community groups (geographic auto-suggestion)
- [x] Group discussion posts + replies
- [x] Push notifications (messages, swap matches)
- [x] Basic swap matching

### Out of Scope (v1.x / v2.0)

- [ ] In-app payments (Stripe) — launch with cash/Venmo at meetup
- [ ] Shipping integration — local only at launch
- [ ] Events / meetups
- [ ] Saved searches with alerts
- [ ] Map view in search
- [ ] Reporting / moderation tools (manual review via Supabase dashboard at launch)
- [ ] Analytics dashboard
- [ ] Algorithmic feed ranking

**Rationale for scope cuts:** Ship the two-sided marketplace loop (list → discover → message → transact) and the social hook (groups) as fast as possible. Payments and shipping are high-complexity, low-urgency for a local-first MVP. Parents are comfortable with Venmo / cash at a park.

---

## 8. LLM Implementation Prompt

Use the following prompt when handing this spec to an LLM for implementation. It is designed to be pasted as a system prompt or prepended to a coding session.

---

```
You are a senior staff engineer building "NestSwap," a mobile-first marketplace
for parents to buy, sell, and swap children's items. The app also has a social
layer (community groups, discussions, DMs) to connect parents locally.

TECH STACK (non-negotiable):
- Expo SDK 52+ (React Native, managed workflow) — single codebase for iOS,
  Android, and web.
- expo-router v4+ for file-based routing.
- Supabase for backend: PostgreSQL (with PostGIS), Auth, Realtime, Edge
  Functions, Storage.
- NativeWind v4 (Tailwind CSS for React Native) for styling.
- Zustand for client state. @tanstack/react-query for server state.
- react-hook-form + zod for forms and validation.
- TypeScript everywhere. Strict mode. No `any`.

MONOREPO STRUCTURE:
nestswap/
├── apps/mobile/         # Expo app
│   ├── app/             # expo-router routes (file-based)
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom hooks
│   ├── services/        # Supabase client, API helpers
│   ├── stores/          # Zustand stores
│   ├── constants/       # Theme, categories, config
│   └── types/           # App-specific types
├── packages/shared/     # Shared types, Zod schemas, pure utils
├── supabase/            # Migrations, Edge Functions, seed data
└── turbo.json

ROUTING (expo-router):
app/
├── (tabs)/
│   ├── index.tsx         → Home feed (proximity-sorted listings)
│   ├── search.tsx        → Search + category browse + filters
│   └── community.tsx     → Groups, discussions, DM inbox
├── listing/
│   ├── [id].tsx          → Listing detail
│   └── create.tsx        → Multi-step listing creation
├── profile/[id].tsx      → User profile
├── messages/
│   ├── index.tsx         → Inbox
│   └── [threadId].tsx    → Conversation thread
├── group/[id].tsx        → Group detail + feed
└── _layout.tsx           → Root layout with auth gate

ARCHITECTURE RULES:
1. Functional components only. No class components.
2. Business logic lives in custom hooks (hooks/) and Zustand stores (stores/),
   NOT in components. Components are render-only.
3. All Supabase queries go through service functions in services/supabase.ts.
   Components never import the Supabase client directly.
4. Zod schemas in packages/shared/src/validation.ts are the single source of
   truth for data shapes. Derive TypeScript types from them with z.infer<>.
5. Use react-query for all server data. Mutations use optimistic updates where
   appropriate (e.g., sending a message).
6. Row Level Security (RLS) on every Supabase table. Never trust the client.
7. Images: compress client-side before upload (800px max width, 80% JPEG).
   Use Supabase Storage with image transforms for thumbnails.
8. Location: always request permission gracefully with a pre-permission modal
   explaining why. Fall back to city-level input if denied.

GEOSPATIAL (critical):
Every listing has a PostGIS GEOGRAPHY(POINT, 4326) column. The home feed and
search both require a spatial query:

  SELECT *, ST_Distance(location, user_point) AS distance_m
  FROM listings
  WHERE ST_DWithin(location, user_point, radius_meters)
    AND status = 'active'
  ORDER BY distance_m, created_at DESC;

Wrap this in a Postgres function called `nearby_listings(lat, lng, radius_m,
limit_n, offset_n)` and call via supabase.rpc().

DESIGN TOKENS:
- Primary: #6B8F71 (sage green)
- Accent: #E8836B (soft coral)
- Background: #F7F5F3
- Text: #2D2D2D
- Card radius: 12px
- Button radius: 8px
- Spacing base: 4px (use multiples: 8, 12, 16, 24, 32)
- Font: system default (no custom fonts)
- Icons: lucide-react-native

UI PATTERNS:
- Bottom tab bar with 3 tabs (Home, Search, Community). Use expo-router Tabs.
- Listing cards: hero image (3:2 aspect ratio), title, price badge, distance,
  seller avatar. Pressable → navigates to listing/[id].
- Pull-to-refresh on all feeds.
- Infinite scroll via react-query's useInfiniteQuery + onEndReached.
- Skeleton loading screens (not spinners).
- FAB (floating action button) for "Create Listing" — bottom right, above
  tab bar, accent color.
- Slide-up bottom sheets for filters (use @gorhom/bottom-sheet).
- Toast notifications for success/error (use sonner-native or burnt).

WHEN IMPLEMENTING, FOLLOW THIS ORDER:
1. Supabase schema: migrations for all tables, indexes, RLS policies, and the
   nearby_listings RPC function.
2. packages/shared: Zod schemas + derived types for all domain entities.
3. apps/mobile foundation: Expo config, NativeWind setup, Supabase client
   initialization, auth flow (sign up, sign in, sign out), root layout with
   auth gate.
4. Tab navigation + placeholder screens.
5. Home feed: service function → react-query hook → feed component with
   listing cards.
6. Listing detail screen.
7. Create listing flow.
8. Search tab with filters.
9. Messaging (DMs with Supabase Realtime).
10. Community tab (groups, posts, replies).
11. User profiles + ratings.

For each screen, produce:
- The route file (app/...)
- Any new components (components/...)
- The service function (services/...)
- The react-query hook (hooks/...)
- The Zustand store slice if needed (stores/...)
- Any new Zod schemas (packages/shared/...)

Write complete, production-quality code. No placeholders, no "// TODO",
no abbreviated implementations. Every file should be shippable.
```

---

## 9. Success Metrics (North Stars)

| Metric | Target (3 months post-launch) |
|--------|-------------------------------|
| Listings created | 500+ in launch market |
| Monthly active users | 200+ |
| Transaction completion rate | > 40% of initiated conversations lead to a transaction |
| Time to first listing | < 3 minutes from signup |
| Group join rate | > 60% of users join at least one group |
| Repeat usage (WAU/MAU) | > 50% |

---

## 10. Launch Strategy

**Geo-focused launch.** Pick one metro area (e.g., Tacoma/South Sound). Saturate it before expanding. A marketplace with 500 listings in one city is useful. A marketplace with 500 listings spread across 50 cities is useless.

**Supply-side seeding:** Partner with 2–3 local parent groups (Facebook groups, library storytime groups, MOPS chapters). Offer to help members photograph and list their items at a "NestSwap listing party." Get 100 listings live before public launch.

**Demand-side:** Targeted ads on Instagram/Facebook to parents within the metro. Message: "Your kid outgrew it. Their kid needs it. NestSwap — the neighborhood marketplace for parents."
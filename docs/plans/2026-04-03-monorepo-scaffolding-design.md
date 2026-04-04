# GooGoo Monorepo Scaffolding Design

**Date:** 2026-04-03
**Status:** Approved
**Scope:** Directory structure and project organization only — no implementation code.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Web strategy | Single Expo app now, plan for separate `apps/web/` later | Ship fast with Expo web export. Shared packages make future Next.js extraction cheap. SEO matters long-term for a marketplace. |
| Packages layer | `packages/shared` + `packages/ui` | Types, Zod schemas, and utils travel together — no need to split. Design tokens deserve isolation so both Expo and a future web app consume the same visual language. |
| Edge Functions | Scaffold all five (including post-MVP) | Full vision visible in the tree. Post-MVP functions (`create-checkout`, `generate-shipping-label`) contain minimal stubs. |
| Config organization | Centralized `config/` directory | Keeps repo root clean. Shared ESLint, TypeScript, and Prettier configs live as workspace packages in `config/`. Thin root files extend them. |
| Testing | Colocated unit tests + separate `e2e/` | Unit/component tests sit next to source files (move together). E2E tests (Detox/Maestro) live in `apps/mobile/e2e/` since they don't map 1:1 to source. |
| Package manager | pnpm | Turborepo's recommended pairing. Faster than npm, strict dependency isolation via symlinks. |

---

## Directory Structure

```
googoo/
├── apps/
│   └── mobile/
│       ├── app/
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx
│       │   │   ├── index.tsx              # Home feed
│       │   │   ├── search.tsx             # Search + category browse + filters
│       │   │   └── community.tsx          # Groups, discussions, DM inbox
│       │   ├── listing/
│       │   │   ├── [id].tsx               # Listing detail
│       │   │   └── create.tsx             # Multi-step listing creation
│       │   ├── profile/
│       │   │   └── [id].tsx               # User profile
│       │   ├── messages/
│       │   │   ├── index.tsx              # Inbox
│       │   │   └── [threadId].tsx         # Conversation thread
│       │   ├── group/
│       │   │   └── [id].tsx               # Group detail + feed
│       │   ├── auth/
│       │   │   ├── sign-in.tsx            # Email + Apple + Google sign-in
│       │   │   └── sign-up.tsx            # Registration
│       │   ├── onboarding/
│       │   │   └── index.tsx              # Location → kid ages → interests
│       │   └── _layout.tsx                # Root layout with auth gate
│       ├── components/
│       │   ├── listings/
│       │   │   ├── ListingCard.tsx
│       │   │   └── ListingCard.test.tsx
│       │   ├── common/
│       │   │   ├── Avatar.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── FAB.tsx
│       │   │   └── SkeletonLoader.tsx
│       │   └── community/
│       │       ├── GroupCard.tsx
│       │       └── PostCard.tsx
│       ├── hooks/
│       │   ├── useNearbyListings.ts
│       │   ├── useAuth.ts
│       │   ├── useLocation.ts
│       │   └── useMessages.ts
│       ├── services/
│       │   ├── supabase.ts                # Client init + typed helpers
│       │   ├── listings.ts                # Listing CRUD + nearby RPC
│       │   ├── auth.ts                    # Auth flows
│       │   ├── messages.ts                # DM queries + Realtime subscriptions
│       │   ├── groups.ts                  # Group/post queries
│       │   └── storage.ts                 # Image upload + compression
│       ├── stores/
│       │   ├── authStore.ts               # User session, profile
│       │   └── locationStore.ts           # Current coords, selected radius
│       ├── constants/
│       │   ├── categories.ts              # Category list + icons
│       │   └── config.ts                  # Feature flags, API URLs, defaults
│       ├── types/
│       │   └── navigation.ts              # App-specific route param types
│       ├── e2e/
│       │   ├── flows/
│       │   │   ├── auth.test.ts
│       │   │   ├── createListing.test.ts
│       │   │   └── messaging.test.ts
│       │   └── setup.ts
│       ├── assets/
│       │   ├── icon.png
│       │   ├── splash.png
│       │   └── adaptive-icon.png
│       ├── app.json
│       ├── babel.config.js
│       ├── tailwind.config.js             # NativeWind, imports @googoo/ui tokens
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── shared/                            # @googoo/shared — no React dependency
│   │   ├── src/
│   │   │   ├── types.ts                   # Domain types (Listing, User, Transaction, etc.)
│   │   │   ├── validation.ts              # Zod schemas — single source of truth
│   │   │   ├── utils.ts                   # Pure utility functions
│   │   │   └── index.ts                   # Barrel export
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── ui/                                # @googoo/ui — design tokens + theme
│       ├── src/
│       │   ├── tokens/
│       │   │   ├── colors.ts              # #6B8F71 sage, #E8836B coral, neutrals
│       │   │   ├── spacing.ts             # 4px base grid
│       │   │   ├── radii.ts               # 12px cards, 8px buttons, 20px avatars
│       │   │   ├── typography.ts           # System font stacks, size scale
│       │   │   └── index.ts
│       │   ├── theme.ts                   # Composed theme object
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── config/
│   ├── eslint/                            # @googoo/eslint-config
│   │   ├── base.js                        # Shared rules (TypeScript, import order)
│   │   ├── react.js                       # React/RN rules (extends base)
│   │   └── package.json
│   ├── typescript/                        # @googoo/typescript-config
│   │   ├── base.json                      # Strict mode, shared compiler options
│   │   ├── react-native.json              # Extends base, adds JSX + RN settings
│   │   └── package.json
│   └── prettier/                          # @googoo/prettier-config
│       ├── index.js
│       └── package.json
├── supabase/
│   ├── migrations/
│   │   ├── 00001_create_profiles.sql
│   │   ├── 00002_create_listings.sql
│   │   ├── 00003_create_transactions.sql
│   │   ├── 00004_create_reviews.sql
│   │   ├── 00005_create_messages.sql
│   │   ├── 00006_create_groups.sql
│   │   ├── 00007_create_posts.sql
│   │   ├── 00008_create_events.sql
│   │   ├── 00009_create_saved_searches.sql
│   │   ├── 00010_create_indexes.sql
│   │   ├── 00011_create_rls_policies.sql
│   │   └── 00012_create_rpc_functions.sql # nearby_listings(), swap matching
│   ├── functions/
│   │   ├── create-listing/
│   │   │   └── index.ts
│   │   ├── create-checkout/
│   │   │   └── index.ts                   # Post-MVP stub
│   │   ├── generate-shipping-label/
│   │   │   └── index.ts                   # Post-MVP stub
│   │   ├── notify-swap-match/
│   │   │   └── index.ts
│   │   └── send-push-notification/
│   │       └── index.ts
│   ├── seed.sql
│   └── config.toml
├── .gitignore
├── .env.example
├── .eslintrc.js                           # Thin — extends @googoo/eslint-config
├── .prettierrc                            # Thin — extends @googoo/prettier-config
├── turbo.json
├── tsconfig.json                          # Thin — extends @googoo/typescript-config
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## Workspace Package Names

| Directory | Package name | Consumers |
|-----------|-------------|-----------|
| `apps/mobile` | `@googoo/mobile` | — |
| `packages/shared` | `@googoo/shared` | `apps/mobile`, `supabase/functions/*` |
| `packages/ui` | `@googoo/ui` | `apps/mobile`, future `apps/web` |
| `config/eslint` | `@googoo/eslint-config` | All workspaces |
| `config/typescript` | `@googoo/typescript-config` | All workspaces |
| `config/prettier` | `@googoo/prettier-config` | All workspaces |

---

## Future Expansion Path

When web SEO and desktop UX become priorities, add:

```
apps/
├── mobile/          # Existing Expo app
└── web/             # New Next.js app
    ├── app/         # Next.js App Router
    ├── components/  # Web-specific components
    └── ...
```

Both `apps/mobile` and `apps/web` import from `@googoo/shared` (types, validation) and `@googoo/ui` (tokens, theme). Domain logic stays shared; presentation diverges per platform.

---

## Architecture Rules (from README, preserved here for reference)

1. Functional components only.
2. Business logic in `hooks/` and `stores/`, not in components.
3. All Supabase queries go through `services/`. Components never import the Supabase client.
4. Zod schemas in `@googoo/shared` are the single source of truth. Derive types with `z.infer<>`.
5. `@tanstack/react-query` for all server data. Optimistic updates where appropriate.
6. Row Level Security on every Supabase table.
7. Client-side image compression before upload (800px max, 80% JPEG).
8. Graceful location permission requests with fallback to city-level input.

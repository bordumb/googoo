# GooGoo Monorepo Scaffolding — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold the complete GooGoo monorepo so a developer can clone, `pnpm install`, and start building features immediately.

**Architecture:** Turborepo monorepo with pnpm workspaces. Single Expo app (`apps/mobile`) for iOS/Android/web. Shared packages for types/validation (`packages/shared`) and design tokens (`packages/ui`). Centralized tooling configs in `config/`. Supabase backend with SQL migrations and Deno Edge Functions.

**Tech Stack:** pnpm, Turborepo, Expo SDK 52+, expo-router v4, NativeWind v4, Supabase, Zustand, TanStack Query v5, Zod, TypeScript (strict).

**Reference:** Design doc at `docs/plans/2026-04-03-monorepo-scaffolding-design.md`, full spec at `README.md`.

---

## Task 1: Root Workspace Foundation

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `.env.example`

**Step 1: Create root `package.json`**

```json
{
  "name": "googoo",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2",
    "prettier": "^3"
  },
  "packageManager": "pnpm@9.15.4",
  "engines": {
    "node": ">=20"
  }
}
```

**Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "config/*"
```

**Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".expo/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Step 4: Create `.gitignore`**

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Expo
.expo/
dist/
web-build/
ios/
android/

# Supabase
supabase/.temp/
supabase/.branches/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Turbo
.turbo/

# Build
*.tsbuildinfo

# Testing
coverage/
```

**Step 5: Create `.env.example`**

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe (post-MVP)
STRIPE_SECRET_KEY=sk_test_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Shipping (post-MVP)
EASYPOST_API_KEY=...

# Expo Push Notifications
EXPO_ACCESS_TOKEN=...
```

**Step 6: Verify**

Run: `pnpm install`
Expected: Installs turbo and prettier at root. No errors.

**Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json .gitignore .env.example pnpm-lock.yaml
git commit -m "chore: initialize monorepo with pnpm + turborepo"
```

---

## Task 2: Config Packages — TypeScript

**Files:**
- Create: `config/typescript/package.json`
- Create: `config/typescript/base.json`
- Create: `config/typescript/react-native.json`

**Step 1: Create `config/typescript/package.json`**

```json
{
  "name": "@googoo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "files": ["*.json"]
}
```

**Step 2: Create `config/typescript/base.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "moduleDetection": "force",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**Step 3: Create `config/typescript/react-native.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "noEmit": true
  }
}
```

**Step 4: Create root `tsconfig.json`** (thin file extending config)

```json
{
  "extends": "@googoo/typescript-config/base.json"
}
```

**Step 5: Commit**

```bash
git add config/typescript/ tsconfig.json
git commit -m "chore: add shared typescript config package"
```

---

## Task 3: Config Packages — ESLint

**Files:**
- Create: `config/eslint/package.json`
- Create: `config/eslint/base.js`
- Create: `config/eslint/react.js`
- Create: `.eslintrc.js` (root)

**Step 1: Create `config/eslint/package.json`**

```json
{
  "name": "@googoo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "files": ["*.js"],
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8",
    "@typescript-eslint/parser": "^8",
    "eslint-plugin-import": "^2",
    "eslint-config-prettier": "^9"
  },
  "peerDependencies": {
    "eslint": "^8 || ^9"
  }
}
```

**Step 2: Create `config/eslint/base.js`**

```js
/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],
  },
  ignorePatterns: ["node_modules/", "dist/", ".expo/", ".turbo/"],
};
```

**Step 3: Create `config/eslint/react.js`**

```js
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["react", "react-hooks"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
};
```

Note: `eslint-plugin-react` and `eslint-plugin-react-hooks` are peer deps provided by `apps/mobile`. They don't belong in the config package because non-React workspaces (like `packages/shared`) shouldn't pull them in.

**Step 4: Create root `.eslintrc.js`**

```js
module.exports = {
  root: true,
  extends: ["@googoo/eslint-config/base"],
};
```

**Step 5: Run `pnpm install` to resolve new workspace**

Run: `pnpm install`
Expected: `@googoo/eslint-config` linked as workspace package.

**Step 6: Commit**

```bash
git add config/eslint/ .eslintrc.js pnpm-lock.yaml
git commit -m "chore: add shared eslint config package"
```

---

## Task 4: Config Packages — Prettier

**Files:**
- Create: `config/prettier/package.json`
- Create: `config/prettier/index.js`
- Create: `.prettierrc` (root)

**Step 1: Create `config/prettier/package.json`**

```json
{
  "name": "@googoo/prettier-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "main": "index.js",
  "files": ["index.js"],
  "peerDependencies": {
    "prettier": "^3"
  }
}
```

**Step 2: Create `config/prettier/index.js`**

```js
/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 100,
  bracketSpacing: true,
};
```

**Step 3: Create root `.prettierrc`**

```json
"@googoo/prettier-config"
```

(This is the documented way to extend a shared Prettier config from a package.)

**Step 4: Commit**

```bash
git add config/prettier/ .prettierrc
git commit -m "chore: add shared prettier config package"
```

---

## Task 5: `packages/shared` — Types, Validation, Utils

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/validation.ts`
- Create: `packages/shared/src/utils.ts`

**Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "@googoo/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3"
  },
  "devDependencies": {
    "@googoo/eslint-config": "workspace:*",
    "@googoo/typescript-config": "workspace:*",
    "eslint": "^8",
    "typescript": "^5"
  }
}
```

**Step 2: Create `packages/shared/tsconfig.json`**

```json
{
  "extends": "@googoo/typescript-config/base.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

**Step 3: Create `packages/shared/src/types.ts`**

Stub with domain type placeholders derived from the README data model:

```ts
/**
 * GooGoo domain types.
 * These will be replaced with z.infer<> from validation.ts as schemas are built out.
 */

export type ListingStatus = "active" | "reserved" | "sold" | "swapped" | "removed";
export type ListingType = "sell" | "swap" | "free";
export type ItemCondition = "new_with_tags" | "like_new" | "good" | "fair";
export type AgeRange = "newborn" | "0_3mo" | "3_6mo" | "6_12mo" | "1_2yr" | "2_4yr" | "4_6yr";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  neighborhood: string | null;
  kid_ages: string[];
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
  status: string;
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
```

**Step 4: Create `packages/shared/src/validation.ts`**

Stub with the most important Zod schemas. These will become the single source of truth (types.ts types will eventually be replaced with `z.infer<>`):

```ts
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
```

**Step 5: Create `packages/shared/src/utils.ts`**

```ts
/** Format cents as a dollar string. Returns "Free" for null (swap/free listings). */
export function formatPrice(cents: number | null): string {
  if (cents === null) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

/** Format meters as a human-readable distance string. */
export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) return "Nearby";
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
  return `${miles.toFixed(1)} mi`;
}
```

**Step 6: Create `packages/shared/src/index.ts`**

```ts
export * from "./types";
export * from "./validation";
export * from "./utils";
```

**Step 7: Verify**

Run: `pnpm install && pnpm --filter @googoo/shared typecheck`
Expected: No type errors.

**Step 8: Commit**

```bash
git add packages/shared/
git commit -m "feat: add @googoo/shared package with domain types, zod schemas, and utils"
```

---

## Task 6: `packages/ui` — Design Tokens and Theme

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/tokens/colors.ts`
- Create: `packages/ui/src/tokens/spacing.ts`
- Create: `packages/ui/src/tokens/radii.ts`
- Create: `packages/ui/src/tokens/typography.ts`
- Create: `packages/ui/src/tokens/index.ts`
- Create: `packages/ui/src/theme.ts`
- Create: `packages/ui/src/index.ts`

**Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@googoo/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@googoo/eslint-config": "workspace:*",
    "@googoo/typescript-config": "workspace:*",
    "eslint": "^8",
    "typescript": "^5"
  }
}
```

**Step 2: Create `packages/ui/tsconfig.json`**

```json
{
  "extends": "@googoo/typescript-config/base.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

**Step 3: Create `packages/ui/src/tokens/colors.ts`**

```ts
export const colors = {
  primary: {
    DEFAULT: "#6B8F71",
    light: "#8FB396",
    dark: "#4A6B4F",
  },
  accent: {
    DEFAULT: "#E8836B",
    light: "#F0A896",
    dark: "#D4604A",
  },
  neutral: {
    50: "#F7F5F3",
    100: "#EDEBE8",
    200: "#D9D6D2",
    300: "#B8B4AF",
    400: "#8F8A84",
    500: "#6B665F",
    600: "#4A4641",
    700: "#3A3733",
    800: "#2D2D2D",
    900: "#1A1A1A",
  },
  success: "#4CAF50",
  error: "#E53935",
  warning: "#FB8C00",
  background: "#F7F5F3",
  text: "#2D2D2D",
} as const;
```

**Step 4: Create `packages/ui/src/tokens/spacing.ts`**

```ts
/** 4px base grid. All values in pixels. */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;
```

**Step 5: Create `packages/ui/src/tokens/radii.ts`**

```ts
export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
  /** Cards: 12px */
  card: 12,
  /** Buttons: 8px */
  button: 8,
  /** Avatars: circular */
  avatar: 9999,
} as const;
```

**Step 6: Create `packages/ui/src/tokens/typography.ts`**

```ts
export const typography = {
  fontFamily: {
    sans: 'System, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    mono: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
  },
  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;
```

**Step 7: Create `packages/ui/src/tokens/index.ts`**

```ts
export { colors } from "./colors";
export { spacing } from "./spacing";
export { radii } from "./radii";
export { typography } from "./typography";
```

**Step 8: Create `packages/ui/src/theme.ts`**

```ts
import { colors } from "./tokens/colors";
import { radii } from "./tokens/radii";
import { spacing } from "./tokens/spacing";
import { typography } from "./tokens/typography";

export const theme = {
  colors,
  spacing,
  radii,
  typography,
} as const;

export type Theme = typeof theme;
```

**Step 9: Create `packages/ui/src/index.ts`**

```ts
export * from "./tokens";
export { theme, type Theme } from "./theme";
```

**Step 10: Verify**

Run: `pnpm install && pnpm --filter @googoo/ui typecheck`
Expected: No type errors.

**Step 11: Commit**

```bash
git add packages/ui/
git commit -m "feat: add @googoo/ui package with design tokens and theme"
```

---

## Task 7: Expo Mobile App — Initialization and Config

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/tailwind.config.js`
- Create: `apps/mobile/global.css`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/.eslintrc.js`

**Step 1: Create `apps/mobile/package.json`**

```json
{
  "name": "@googoo/mobile",
  "version": "0.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "dev:ios": "expo start --ios",
    "dev:android": "expo start --android",
    "dev:web": "expo start --web",
    "build:web": "expo export -p web",
    "lint": "eslint app/ components/ hooks/ services/ stores/ constants/ types/",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "e2e": "maestro test e2e/"
  },
  "dependencies": {
    "@gorhom/bottom-sheet": "^5",
    "@googoo/shared": "workspace:*",
    "@googoo/ui": "workspace:*",
    "@supabase/supabase-js": "^2",
    "@tanstack/react-query": "^5",
    "burnt": "^0.12",
    "expo": "~52.0.0",
    "expo-image-picker": "~16.0.0",
    "expo-location": "~18.0.0",
    "expo-notifications": "~0.29.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-status-bar": "~2.0.0",
    "lucide-react-native": "^0.468",
    "nativewind": "^4",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-hook-form": "^7",
    "react-native": "0.76.6",
    "react-native-gesture-handler": "~2.20.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-safe-area-context": "~4.14.0",
    "react-native-screens": "~4.4.0",
    "react-native-svg": "~15.8.0",
    "react-native-web": "~0.19.13",
    "zustand": "^5",
    "zod": "^3"
  },
  "devDependencies": {
    "@babel/core": "^7",
    "@googoo/eslint-config": "workspace:*",
    "@googoo/typescript-config": "workspace:*",
    "@types/react": "~18.3.0",
    "eslint": "^8",
    "eslint-plugin-react": "^7",
    "eslint-plugin-react-hooks": "^5",
    "jest": "^29",
    "jest-expo": "~52.0.0",
    "tailwindcss": "^3.4",
    "typescript": "^5"
  }
}
```

**Step 2: Create `apps/mobile/app.json`**

```json
{
  "expo": {
    "name": "GooGoo",
    "slug": "googoo",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#F7F5F3"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.googoo.app",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "GooGoo uses your location to show nearby listings and connect you with local parents.",
        "NSCameraUsageDescription": "GooGoo uses your camera to take photos of items you want to list.",
        "NSPhotoLibraryUsageDescription": "GooGoo accesses your photos to add images to your listings."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F7F5F3"
      },
      "package": "com.googoo.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA"
      ]
    },
    "web": {
      "favicon": "./assets/icon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      "expo-location",
      "expo-image-picker",
      "expo-notifications",
      "expo-secure-store"
    ],
    "scheme": "googoo",
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**Step 3: Create `apps/mobile/babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

**Step 4: Create `apps/mobile/metro.config.js`**

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Resolve modules from both the app and the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
```

**Step 5: Create `apps/mobile/tailwind.config.js`**

```js
const { colors, spacing, radii } = require("@googoo/ui/src/tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        accent: colors.accent,
        neutral: colors.neutral,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        background: colors.background,
      },
      borderRadius: {
        card: `${radii.card}px`,
        button: `${radii.button}px`,
      },
    },
  },
  plugins: [],
};
```

**Step 6: Create `apps/mobile/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 7: Create `apps/mobile/tsconfig.json`**

```json
{
  "extends": "@googoo/typescript-config/react-native.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

**Step 8: Create `apps/mobile/.eslintrc.js`**

```js
module.exports = {
  root: true,
  extends: ["@googoo/eslint-config/react"],
};
```

**Step 9: Create placeholder asset files**

Create empty placeholder files for `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`. (These are 1x1 transparent PNGs — real assets come later from design.)

Generate minimal 1x1 PNGs:

```bash
# Create minimal valid PNG files as placeholders
cd apps/mobile/assets
# Use a one-liner to create a minimal 1x1 white PNG (67 bytes)
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > icon.png
cp icon.png splash.png
cp icon.png adaptive-icon.png
```

**Step 10: Verify**

Run: `pnpm install`
Expected: All workspace packages resolve. No errors.

**Step 11: Commit**

```bash
git add apps/mobile/package.json apps/mobile/app.json apps/mobile/babel.config.js apps/mobile/metro.config.js apps/mobile/tailwind.config.js apps/mobile/global.css apps/mobile/tsconfig.json apps/mobile/.eslintrc.js apps/mobile/assets/
git commit -m "feat: initialize expo mobile app with config files"
```

---

## Task 8: Mobile App — Root Layout and Tab Navigation

**Files:**
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/index.tsx`
- Create: `apps/mobile/app/(tabs)/search.tsx`
- Create: `apps/mobile/app/(tabs)/community.tsx`

**Step 1: Create `apps/mobile/app/_layout.tsx`**

```tsx
import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[id]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen
            name="listing/create"
            options={{ presentation: "modal", headerShown: true, title: "New Listing" }}
          />
          <Stack.Screen name="profile/[id]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="messages/index" options={{ headerShown: true, title: "Messages" }} />
          <Stack.Screen name="messages/[threadId]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="group/[id]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="auth/sign-in" />
          <Stack.Screen name="auth/sign-up" />
          <Stack.Screen name="onboarding/index" />
        </Stack>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

**Step 2: Create `apps/mobile/app/(tabs)/_layout.tsx`**

```tsx
import { Tabs } from "expo-router";
import { Home, Search, Users } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6B8F71",
        tabBarInactiveTintColor: "#8F8A84",
        tabBarStyle: {
          backgroundColor: "#F7F5F3",
          borderTopColor: "#EDEBE8",
        },
        headerStyle: {
          backgroundColor: "#F7F5F3",
        },
        headerTintColor: "#2D2D2D",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
```

**Step 3: Create `apps/mobile/app/(tabs)/index.tsx`**

```tsx
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Home Feed</Text>
      <Text className="mt-2 text-neutral-400">Nearby listings will appear here</Text>
    </View>
  );
}
```

**Step 4: Create `apps/mobile/app/(tabs)/search.tsx`**

```tsx
import { Text, View } from "react-native";

export default function SearchScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Search</Text>
      <Text className="mt-2 text-neutral-400">Search and browse categories</Text>
    </View>
  );
}
```

**Step 5: Create `apps/mobile/app/(tabs)/community.tsx`**

```tsx
import { Text, View } from "react-native";

export default function CommunityScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Community</Text>
      <Text className="mt-2 text-neutral-400">Groups, discussions, and messages</Text>
    </View>
  );
}
```

**Step 6: Commit**

```bash
git add apps/mobile/app/
git commit -m "feat: add root layout and tab navigation stubs"
```

---

## Task 9: Mobile App — Remaining Route Stubs

**Files:**
- Create: `apps/mobile/app/listing/[id].tsx`
- Create: `apps/mobile/app/listing/create.tsx`
- Create: `apps/mobile/app/profile/[id].tsx`
- Create: `apps/mobile/app/messages/index.tsx`
- Create: `apps/mobile/app/messages/[threadId].tsx`
- Create: `apps/mobile/app/group/[id].tsx`
- Create: `apps/mobile/app/auth/sign-in.tsx`
- Create: `apps/mobile/app/auth/sign-up.tsx`
- Create: `apps/mobile/app/onboarding/index.tsx`

**Step 1: Create `apps/mobile/app/listing/[id].tsx`**

```tsx
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Listing Detail</Text>
      <Text className="mt-2 text-neutral-400">Listing: {id}</Text>
    </View>
  );
}
```

**Step 2: Create `apps/mobile/app/listing/create.tsx`**

```tsx
import { Text, View } from "react-native";

export default function CreateListingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Create Listing</Text>
      <Text className="mt-2 text-neutral-400">Multi-step listing creation flow</Text>
    </View>
  );
}
```

**Step 3: Create `apps/mobile/app/profile/[id].tsx`**

```tsx
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Profile</Text>
      <Text className="mt-2 text-neutral-400">User: {id}</Text>
    </View>
  );
}
```

**Step 4: Create `apps/mobile/app/messages/index.tsx`**

```tsx
import { Text, View } from "react-native";

export default function InboxScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Inbox</Text>
      <Text className="mt-2 text-neutral-400">Your conversations</Text>
    </View>
  );
}
```

**Step 5: Create `apps/mobile/app/messages/[threadId].tsx`**

```tsx
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function ConversationScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Conversation</Text>
      <Text className="mt-2 text-neutral-400">Thread: {threadId}</Text>
    </View>
  );
}
```

**Step 6: Create `apps/mobile/app/group/[id].tsx`**

```tsx
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Group</Text>
      <Text className="mt-2 text-neutral-400">Group: {id}</Text>
    </View>
  );
}
```

**Step 7: Create `apps/mobile/app/auth/sign-in.tsx`**

```tsx
import { Text, View } from "react-native";

export default function SignInScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Sign In</Text>
      <Text className="mt-2 text-neutral-400">Email, Apple, or Google sign-in</Text>
    </View>
  );
}
```

**Step 8: Create `apps/mobile/app/auth/sign-up.tsx`**

```tsx
import { Text, View } from "react-native";

export default function SignUpScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Sign Up</Text>
      <Text className="mt-2 text-neutral-400">Create your GooGoo account</Text>
    </View>
  );
}
```

**Step 9: Create `apps/mobile/app/onboarding/index.tsx`**

```tsx
import { Text, View } from "react-native";

export default function OnboardingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-text">Welcome to GooGoo</Text>
      <Text className="mt-2 text-neutral-400">Location, kid ages, interests</Text>
    </View>
  );
}
```

**Step 10: Commit**

```bash
git add apps/mobile/app/
git commit -m "feat: add all route stubs (listing, profile, messages, group, auth, onboarding)"
```

---

## Task 10: Mobile App — Components, Hooks, Services, Stores, Constants, Types

**Files:**
- Create: `apps/mobile/components/listings/ListingCard.tsx`
- Create: `apps/mobile/components/common/Avatar.tsx`
- Create: `apps/mobile/components/common/Badge.tsx`
- Create: `apps/mobile/components/common/FAB.tsx`
- Create: `apps/mobile/components/common/SkeletonLoader.tsx`
- Create: `apps/mobile/components/community/GroupCard.tsx`
- Create: `apps/mobile/components/community/PostCard.tsx`
- Create: `apps/mobile/hooks/useNearbyListings.ts`
- Create: `apps/mobile/hooks/useAuth.ts`
- Create: `apps/mobile/hooks/useLocation.ts`
- Create: `apps/mobile/hooks/useMessages.ts`
- Create: `apps/mobile/services/supabase.ts`
- Create: `apps/mobile/services/listings.ts`
- Create: `apps/mobile/services/auth.ts`
- Create: `apps/mobile/services/messages.ts`
- Create: `apps/mobile/services/groups.ts`
- Create: `apps/mobile/services/storage.ts`
- Create: `apps/mobile/stores/authStore.ts`
- Create: `apps/mobile/stores/locationStore.ts`
- Create: `apps/mobile/constants/categories.ts`
- Create: `apps/mobile/constants/config.ts`
- Create: `apps/mobile/types/navigation.ts`

All files in this task are minimal stubs with typed signatures and `// TODO` markers. They establish the module structure and import patterns without implementing features. Only the Supabase client init (`services/supabase.ts`) and constants contain real code.

**Step 1: Create component stubs**

`apps/mobile/components/listings/ListingCard.tsx`:

```tsx
import { Pressable, Text, View } from "react-native";

import type { Listing } from "@googoo/shared";

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
}

export function ListingCard({ listing, onPress }: ListingCardProps) {
  return (
    <Pressable onPress={onPress} className="rounded-card bg-white p-4">
      <Text className="text-text">{listing.title}</Text>
    </Pressable>
  );
}
```

`apps/mobile/components/common/Avatar.tsx`:

```tsx
import { Image, View } from "react-native";

interface AvatarProps {
  uri: string | null;
  size?: number;
}

export function Avatar({ uri, size = 40 }: AvatarProps) {
  return (
    <View
      className="overflow-hidden rounded-full bg-neutral-200"
      style={{ width: size, height: size }}
    >
      {uri && <Image source={{ uri }} style={{ width: size, height: size }} />}
    </View>
  );
}
```

`apps/mobile/components/common/Badge.tsx`:

```tsx
import { Text, View } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "primary" | "accent" | "neutral";
}

export function Badge({ label, variant = "primary" }: BadgeProps) {
  const bgClass = {
    primary: "bg-primary",
    accent: "bg-accent",
    neutral: "bg-neutral-200",
  }[variant];

  return (
    <View className={`rounded-full px-2 py-1 ${bgClass}`}>
      <Text className="text-xs text-white">{label}</Text>
    </View>
  );
}
```

`apps/mobile/components/common/FAB.tsx`:

```tsx
import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-24 right-6 h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg"
    >
      <Plus color="white" size={24} />
    </Pressable>
  );
}
```

`apps/mobile/components/common/SkeletonLoader.tsx`:

```tsx
import { View } from "react-native";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  rounded?: boolean;
}

export function SkeletonLoader({ width = "100%", height = 20, rounded = false }: SkeletonLoaderProps) {
  return (
    <View
      className={`bg-neutral-200 ${rounded ? "rounded-full" : "rounded-md"}`}
      style={{ width, height }}
    />
  );
}
```

`apps/mobile/components/community/GroupCard.tsx`:

```tsx
import { Pressable, Text, View } from "react-native";

import type { Group } from "@googoo/shared";

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  return (
    <Pressable onPress={onPress} className="rounded-card bg-white p-4">
      <Text className="font-semibold text-text">{group.name}</Text>
      {group.description && (
        <Text className="mt-1 text-neutral-400">{group.description}</Text>
      )}
    </Pressable>
  );
}
```

`apps/mobile/components/community/PostCard.tsx`:

```tsx
import { Text, View } from "react-native";

import type { Post } from "@googoo/shared";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <View className="rounded-card bg-white p-4">
      <Text className="text-text">{post.content}</Text>
    </View>
  );
}
```

**Step 2: Create service stubs**

`apps/mobile/services/supabase.ts`:

```ts
import "react-native-url-polyfill/dist/polyfill";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

`apps/mobile/services/listings.ts`:

```ts
import type { Listing } from "@googoo/shared";

import { supabase } from "./supabase";

export interface NearbyListingsParams {
  lat: number;
  lng: number;
  radiusMeters: number;
  limit: number;
  offset: number;
}

export async function fetchNearbyListings(
  _params: NearbyListingsParams,
): Promise<Listing[]> {
  // Will call supabase.rpc("nearby_listings", params)
  return [];
}

export async function fetchListingById(_id: string): Promise<Listing | null> {
  return null;
}
```

`apps/mobile/services/auth.ts`:

```ts
import { supabase } from "./supabase";

export async function signInWithEmail(_email: string, _password: string) {
  // Will call supabase.auth.signInWithPassword()
}

export async function signUpWithEmail(_email: string, _password: string) {
  // Will call supabase.auth.signUp()
}

export async function signOut() {
  await supabase.auth.signOut();
}
```

`apps/mobile/services/messages.ts`:

```ts
import type { Message } from "@googoo/shared";

export async function fetchThreadMessages(_threadId: string): Promise<Message[]> {
  return [];
}

export async function sendMessage(
  _threadId: string,
  _content: string,
): Promise<Message | null> {
  return null;
}
```

`apps/mobile/services/groups.ts`:

```ts
import type { Group, Post } from "@googoo/shared";

export async function fetchNearbyGroups(_lat: number, _lng: number): Promise<Group[]> {
  return [];
}

export async function fetchGroupPosts(_groupId: string): Promise<Post[]> {
  return [];
}
```

`apps/mobile/services/storage.ts`:

```ts
export async function uploadImage(_uri: string, _bucket: string): Promise<string | null> {
  // Will compress with expo-image-manipulator, then upload to Supabase Storage
  return null;
}
```

**Step 3: Create hook stubs**

`apps/mobile/hooks/useNearbyListings.ts`:

```ts
import { useQuery } from "@tanstack/react-query";

import { fetchNearbyListings } from "@/services/listings";
import { useLocationStore } from "@/stores/locationStore";

export function useNearbyListings() {
  const { lat, lng, radiusMeters } = useLocationStore();

  return useQuery({
    queryKey: ["listings", "nearby", lat, lng, radiusMeters],
    queryFn: () =>
      fetchNearbyListings({ lat, lng, radiusMeters, limit: 20, offset: 0 }),
    enabled: lat !== 0 && lng !== 0,
  });
}
```

`apps/mobile/hooks/useAuth.ts`:

```ts
import { useEffect, useState } from "react";

import type { Profile } from "@googoo/shared";

import { supabase } from "@/services/supabase";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isLoading, isAuthenticated, profile };
}
```

`apps/mobile/hooks/useLocation.ts`:

```ts
import { useEffect } from "react";
import * as Location from "expo-location";

import { useLocationStore } from "@/stores/locationStore";

export function useLocation() {
  const { setCoords } = useLocationStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      setCoords(location.coords.latitude, location.coords.longitude);
    })();
  }, [setCoords]);
}
```

`apps/mobile/hooks/useMessages.ts`:

```ts
import { useQuery } from "@tanstack/react-query";

import { fetchThreadMessages } from "@/services/messages";

export function useMessages(threadId: string) {
  return useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => fetchThreadMessages(threadId),
    enabled: !!threadId,
  });
}
```

**Step 4: Create store stubs**

`apps/mobile/stores/authStore.ts`:

```ts
import { create } from "zustand";

import type { Profile } from "@googoo/shared";

interface AuthState {
  session: { user: { id: string } } | null;
  profile: Profile | null;
  setSession: (session: AuthState["session"]) => void;
  setProfile: (profile: Profile | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  clear: () => set({ session: null, profile: null }),
}));
```

`apps/mobile/stores/locationStore.ts`:

```ts
import { create } from "zustand";

interface LocationState {
  lat: number;
  lng: number;
  radiusMeters: number;
  setCoords: (lat: number, lng: number) => void;
  setRadius: (radiusMeters: number) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: 0,
  lng: 0,
  radiusMeters: 16093, // 10 miles in meters
  setCoords: (lat, lng) => set({ lat, lng }),
  setRadius: (radiusMeters) => set({ radiusMeters }),
}));
```

**Step 5: Create constants**

`apps/mobile/constants/categories.ts`:

```ts
export const CATEGORIES = [
  { key: "clothing", label: "Clothing", icon: "shirt" },
  { key: "gear", label: "Gear & Equipment", icon: "baby" },
  { key: "toys", label: "Toys & Books", icon: "blocks" },
  { key: "nursery", label: "Nursery & Furniture", icon: "lamp" },
  { key: "feeding", label: "Feeding & Nursing", icon: "cup-soda" },
  { key: "bath", label: "Bath & Diapering", icon: "bath" },
  { key: "maternity", label: "Maternity", icon: "heart" },
  { key: "other", label: "Other", icon: "package" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
```

`apps/mobile/constants/config.ts`:

```ts
export const CONFIG = {
  /** Default search radius in miles */
  DEFAULT_RADIUS_MILES: 10,
  /** Max images per listing */
  MAX_LISTING_IMAGES: 5,
  /** Image compression target width */
  IMAGE_MAX_WIDTH: 800,
  /** Image compression quality (0-1) */
  IMAGE_QUALITY: 0.8,
  /** Pagination page size */
  PAGE_SIZE: 20,
} as const;
```

**Step 6: Create types**

`apps/mobile/types/navigation.ts`:

```ts
/** App-specific route param types for expo-router. */

export interface ListingDetailParams {
  id: string;
}

export interface ProfileParams {
  id: string;
}

export interface ConversationParams {
  threadId: string;
}

export interface GroupParams {
  id: string;
}
```

**Step 7: Commit**

```bash
git add apps/mobile/components/ apps/mobile/hooks/ apps/mobile/services/ apps/mobile/stores/ apps/mobile/constants/ apps/mobile/types/
git commit -m "feat: add component, hook, service, store, constant, and type stubs"
```

---

## Task 11: Mobile App — E2E Test Scaffolding

**Files:**
- Create: `apps/mobile/e2e/setup.ts`
- Create: `apps/mobile/e2e/flows/auth.test.ts`
- Create: `apps/mobile/e2e/flows/createListing.test.ts`
- Create: `apps/mobile/e2e/flows/messaging.test.ts`

**Step 1: Create `apps/mobile/e2e/setup.ts`**

```ts
/**
 * E2E test setup for Maestro / Detox.
 * Configure test environment, seed data, and cleanup here.
 */

export const E2E_CONFIG = {
  /** Supabase URL for test environment */
  supabaseUrl: process.env.E2E_SUPABASE_URL ?? "http://localhost:54321",
  /** Test user credentials */
  testUser: {
    email: "test@googoo.dev",
    password: "testpassword123",
  },
};
```

**Step 2: Create `apps/mobile/e2e/flows/auth.test.ts`**

```ts
/**
 * E2E: Authentication flow
 * - Sign up with email
 * - Sign out
 * - Sign back in
 */

// Test implementation will use Maestro YAML or Detox JS
// This file serves as the test plan and will be replaced with
// the chosen E2E framework's syntax during implementation.

export {};
```

**Step 3: Create `apps/mobile/e2e/flows/createListing.test.ts`**

```ts
/**
 * E2E: Create listing flow
 * - Tap FAB
 * - Add photo
 * - Fill in title, category, condition, price
 * - Submit listing
 * - Verify listing appears in feed
 */

export {};
```

**Step 4: Create `apps/mobile/e2e/flows/messaging.test.ts`**

```ts
/**
 * E2E: Messaging flow
 * - Navigate to a listing
 * - Tap "Message Seller"
 * - Send a message
 * - Verify message appears in thread
 */

export {};
```

**Step 5: Commit**

```bash
git add apps/mobile/e2e/
git commit -m "feat: add e2e test scaffolding"
```

---

## Task 12: Supabase — Config and Migrations

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/seed.sql`
- Create: `supabase/migrations/00001_create_profiles.sql`
- Create: `supabase/migrations/00002_create_listings.sql`
- Create: `supabase/migrations/00003_create_transactions.sql`
- Create: `supabase/migrations/00004_create_reviews.sql`
- Create: `supabase/migrations/00005_create_messages.sql`
- Create: `supabase/migrations/00006_create_groups.sql`
- Create: `supabase/migrations/00007_create_posts.sql`
- Create: `supabase/migrations/00008_create_events.sql`
- Create: `supabase/migrations/00009_create_saved_searches.sql`
- Create: `supabase/migrations/00010_create_indexes.sql`
- Create: `supabase/migrations/00011_create_rls_policies.sql`
- Create: `supabase/migrations/00012_create_rpc_functions.sql`

**Step 1: Create `supabase/config.toml`**

```toml
[project]
id = "googoo-local"

[api]
enabled = true
port = 54321
schemas = ["public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:8081"
additional_redirect_urls = ["googoo://", "exp://localhost:8081"]

[auth.email]
enable_signup = true
enable_confirmations = false

[storage]
enabled = true
file_size_limit = "10MB"
```

**Step 2: Create `supabase/migrations/00001_create_profiles.sql`**

```sql
-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Trigger function for auto-updating updated_at columns
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    neighborhood TEXT,
    kid_ages TEXT[],
    push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_location ON public.profiles USING GIST(location);

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**Step 3: Create `supabase/migrations/00002_create_listings.sql`**

```sql
CREATE TYPE listing_status AS ENUM ('active', 'reserved', 'sold', 'swapped', 'removed');
CREATE TYPE listing_type AS ENUM ('sell', 'swap', 'free');
CREATE TYPE item_condition AS ENUM ('new_with_tags', 'like_new', 'good', 'fair');
CREATE TYPE age_range AS ENUM ('newborn', '0_3mo', '3_6mo', '6_12mo', '1_2yr', '2_4yr', '4_6yr');

CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    condition item_condition NOT NULL,
    age_range age_range,
    listing_type listing_type NOT NULL,
    price_cents INTEGER,
    swap_preferences TEXT,
    images TEXT[] NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    ships BOOLEAN DEFAULT FALSE,
    status listing_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search column
ALTER TABLE public.listings ADD COLUMN fts tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
    ) STORED;

CREATE TRIGGER listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**Step 4: Create `supabase/migrations/00003_create_transactions.sql`**

```sql
CREATE TYPE transaction_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled');

CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    type listing_type NOT NULL,
    price_cents INTEGER,
    fee_cents INTEGER,
    stripe_payment_intent_id TEXT,
    shipping_label_url TEXT,
    tracking_number TEXT,
    status transaction_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);
```

**Step 5: Create `supabase/migrations/00004_create_reviews.sql`**

```sql
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
    rating BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(transaction_id, reviewer_id)
);
```

**Step 6: Create `supabase/migrations/00005_create_messages.sql`**

```sql
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    listing_id UUID REFERENCES public.listings(id),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Step 7: Create `supabase/migrations/00006_create_groups.sql`**

```sql
CREATE TABLE public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326),
    radius_miles INTEGER,
    is_geographic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (group_id, user_id)
);
```

**Step 8: Create `supabase/migrations/00007_create_posts.sql`**

```sql
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    images TEXT[],
    parent_id UUID REFERENCES public.posts(id),
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Step 9: Create `supabase/migrations/00008_create_events.sql`**

```sql
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
```

**Step 10: Create `supabase/migrations/00009_create_saved_searches.sql`**

```sql
CREATE TABLE public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    query TEXT,
    filters JSONB NOT NULL,
    notify BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Step 11: Create `supabase/migrations/00010_create_indexes.sql`**

```sql
-- Listings indexes
CREATE INDEX idx_listings_location ON public.listings USING GIST(location);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created ON public.listings(created_at DESC);
CREATE INDEX idx_listings_fts ON public.listings USING GIN(fts);
CREATE INDEX idx_listings_seller ON public.listings(seller_id);

-- Messages indexes
CREATE INDEX idx_messages_thread ON public.messages(thread_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- Posts indexes
CREATE INDEX idx_posts_group ON public.posts(group_id, created_at DESC);
CREATE INDEX idx_posts_parent ON public.posts(parent_id);

-- Events indexes
CREATE INDEX idx_events_group ON public.events(group_id);
CREATE INDEX idx_events_starts ON public.events(starts_at);

-- Transactions indexes
CREATE INDEX idx_transactions_listing ON public.transactions(listing_id);
CREATE INDEX idx_transactions_buyer ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON public.transactions(seller_id);

-- Saved searches indexes
CREATE INDEX idx_saved_searches_user ON public.saved_searches(user_id);

-- Groups location index
CREATE INDEX idx_groups_location ON public.groups USING GIST(location);

-- Composite index for messages RLS policy performance
CREATE INDEX idx_messages_sender_thread ON public.messages(sender_id, thread_id);
```

**Step 12: Create `supabase/migrations/00011_create_rls_policies.sql`**

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings: anyone can read active, only seller can modify
CREATE POLICY "Active listings are viewable by everyone" ON public.listings
    FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Users can create own listings" ON public.listings
    FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can update own listings" ON public.listings
    FOR UPDATE USING (seller_id = auth.uid());

-- Transactions: only buyer and seller can see
CREATE POLICY "Transaction parties can view" ON public.transactions
    FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Buyers can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Reviews: anyone can read, only reviewer can create
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);
CREATE POLICY "Reviewers can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Messages: only sender and thread participants can see
CREATE POLICY "Thread participants can view messages" ON public.messages
    FOR SELECT USING (
        sender_id = auth.uid()
        OR thread_id IN (
            SELECT DISTINCT thread_id FROM public.messages WHERE sender_id = auth.uid()
        )
    );
CREATE POLICY "Authenticated users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Groups: anyone can read
CREATE POLICY "Groups are viewable by everyone" ON public.groups
    FOR SELECT USING (true);

-- Group members: anyone can read memberships, members manage own
CREATE POLICY "Group memberships are viewable" ON public.group_members
    FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave groups" ON public.group_members
    FOR DELETE USING (user_id = auth.uid());

-- Posts: group members can read and create
CREATE POLICY "Posts are viewable by group members" ON public.posts
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Group members can create posts" ON public.posts
    FOR INSERT WITH CHECK (
        author_id = auth.uid()
        AND group_id IN (
            SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
        )
    );

-- Events: group members can read, any member can create
CREATE POLICY "Events are viewable by group members" ON public.events
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Group members can create events" ON public.events
    FOR INSERT WITH CHECK (
        creator_id = auth.uid()
        AND group_id IN (
            SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
        )
    );

-- Saved searches: only owner
CREATE POLICY "Users can view own saved searches" ON public.saved_searches
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create saved searches" ON public.saved_searches
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own saved searches" ON public.saved_searches
    FOR DELETE USING (user_id = auth.uid());
```

**Step 13: Create `supabase/migrations/00012_create_rpc_functions.sql`**

```sql
-- Nearby listings RPC function
-- Called via supabase.rpc('nearby_listings', { ... })
CREATE OR REPLACE FUNCTION nearby_listings(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_m INTEGER DEFAULT 16093,  -- 10 miles
    limit_n INTEGER DEFAULT 20,
    offset_n INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    seller_id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    condition item_condition,
    age_range age_range,
    listing_type listing_type,
    price_cents INTEGER,
    swap_preferences TEXT,
    images TEXT[],
    ships BOOLEAN,
    status listing_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    distance_m DOUBLE PRECISION,
    seller_display_name TEXT,
    seller_avatar_url TEXT
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        l.id,
        l.seller_id,
        l.title,
        l.description,
        l.category,
        l.condition,
        l.age_range,
        l.listing_type,
        l.price_cents,
        l.swap_preferences,
        l.images,
        l.ships,
        l.status,
        l.created_at,
        l.updated_at,
        ST_Distance(
            l.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) AS distance_m,
        p.display_name AS seller_display_name,
        p.avatar_url AS seller_avatar_url
    FROM public.listings l
    JOIN public.profiles p ON p.id = l.seller_id
    WHERE l.status = 'active'
      AND ST_DWithin(
          l.location,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
          radius_m
      )
    ORDER BY distance_m ASC, l.created_at DESC
    LIMIT limit_n
    OFFSET offset_n;
$$;

-- Search listings with text + spatial filter
CREATE OR REPLACE FUNCTION search_listings(
    search_query TEXT,
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_m INTEGER DEFAULT 16093,
    limit_n INTEGER DEFAULT 20,
    offset_n INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    seller_id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    condition item_condition,
    listing_type listing_type,
    price_cents INTEGER,
    images TEXT[],
    ships BOOLEAN,
    status listing_status,
    created_at TIMESTAMPTZ,
    distance_m DOUBLE PRECISION,
    rank REAL
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        l.id,
        l.seller_id,
        l.title,
        l.description,
        l.category,
        l.condition,
        l.listing_type,
        l.price_cents,
        l.images,
        l.ships,
        l.status,
        l.created_at,
        ST_Distance(
            l.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) AS distance_m,
        ts_rank(l.fts, plainto_tsquery('english', search_query)) AS rank
    FROM public.listings l
    WHERE l.status = 'active'
      AND l.fts @@ plainto_tsquery('english', search_query)
      AND ST_DWithin(
          l.location,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
          radius_m
      )
    ORDER BY rank DESC, distance_m ASC
    LIMIT limit_n
    OFFSET offset_n;
$$;
```

**Step 14: Create `supabase/seed.sql`**

```sql
-- Seed data for local development
-- Run with: supabase db reset (applies migrations + seed)

-- Note: Seed data requires auth.users to exist first.
-- When using supabase locally, create test users via the Auth UI at localhost:54323,
-- then run this seed to populate their profiles and listings.

-- This file will be populated with test data during development setup.
-- Example structure:

-- INSERT INTO public.profiles (id, display_name, location, neighborhood, kid_ages)
-- VALUES
--   ('user-uuid-1', 'Sarah M.', ST_MakePoint(-122.44, 47.25)::geography, 'Tacoma', ARRAY['6mo', '3yr']),
--   ('user-uuid-2', 'James K.', ST_MakePoint(-122.43, 47.26)::geography, 'Tacoma', ARRAY['1yr']);
```

**Step 15: Commit**

```bash
git add supabase/
git commit -m "feat: add supabase config, all migrations, RLS policies, and RPC functions"
```

---

## Task 13: Supabase — Edge Function Stubs

**Files:**
- Create: `supabase/functions/create-listing/index.ts`
- Create: `supabase/functions/create-checkout/index.ts`
- Create: `supabase/functions/generate-shipping-label/index.ts`
- Create: `supabase/functions/notify-swap-match/index.ts`
- Create: `supabase/functions/send-push-notification/index.ts`

**Step 1: Create `supabase/functions/create-listing/index.ts`**

```ts
// Edge Function: create-listing
// Handles listing creation with server-side validation.
// Invoked via: supabase.functions.invoke('create-listing', { body })

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    // TODO: Validate with @googoo/shared createListingSchema
    // TODO: Insert listing via Supabase admin client
    // TODO: Trigger notify-swap-match if listing_type === 'swap'

    return new Response(JSON.stringify({ success: true, data: body }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

**Step 2: Create `supabase/functions/create-checkout/index.ts`**

```ts
// Edge Function: create-checkout
// Creates a Stripe PaymentIntent for a listing purchase.
// POST-MVP: Not implemented until payments feature is built.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (_req) => {
  return new Response(
    JSON.stringify({
      error: "Not implemented",
      message: "Payment processing is not available in this version.",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 501,
    },
  );
});
```

**Step 3: Create `supabase/functions/generate-shipping-label/index.ts`**

```ts
// Edge Function: generate-shipping-label
// Generates a prepaid shipping label via EasyPost/Shippo.
// POST-MVP: Not implemented until shipping feature is built.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (_req) => {
  return new Response(
    JSON.stringify({
      error: "Not implemented",
      message: "Shipping label generation is not available in this version.",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 501,
    },
  );
});
```

**Step 4: Create `supabase/functions/notify-swap-match/index.ts`**

```ts
// Edge Function: notify-swap-match
// Triggered when a swap listing is created.
// Finds potential swap matches and notifies both parties.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    const { listing_id } = await req.json();

    // TODO: Fetch the new listing
    // TODO: Query active swap listings within radius where categories match
    // TODO: For each match, invoke send-push-notification

    return new Response(
      JSON.stringify({ success: true, listing_id, matches_found: 0 }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

**Step 5: Create `supabase/functions/send-push-notification/index.ts`**

```ts
// Edge Function: send-push-notification
// Sends push notifications via Expo Push API.
// Called by other Edge Functions or database triggers.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    const { user_id, title, body } = await req.json();

    // TODO: Fetch user's push_token from profiles table
    // TODO: Send notification via Expo Push API
    //   POST https://exp.host/--/api/v2/push/send
    //   { to: pushToken, title, body }

    return new Response(
      JSON.stringify({ success: true, user_id, title }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
```

**Step 6: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add all supabase edge function stubs"
```

---

## Task 14: Final Verification — Install, Typecheck, Lint

**Step 1: Run `pnpm install` from root**

Run: `pnpm install`
Expected: Clean install, all workspace packages resolved, no peer dependency errors.

**Step 2: Run typecheck across all workspaces**

Run: `pnpm turbo typecheck`
Expected: All workspaces pass type checking.

**Step 3: Run lint across all workspaces**

Run: `pnpm turbo lint`
Expected: No lint errors (stubs should be clean).

**Step 4: Verify Expo app starts**

Run: `cd apps/mobile && pnpm expo start --web`
Expected: Metro bundler starts, web version loads in browser showing tab navigation with placeholder screens.

**Step 5: Verify Supabase local dev starts (if supabase CLI installed)**

Run: `supabase start`
Expected: Local Supabase instance starts with all migrations applied. Studio available at `localhost:54323`.

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final scaffolding verification — all workspaces install, typecheck, and lint"
```

---

## Summary

| Task | Description | Est. Files |
|------|-------------|-----------|
| 1 | Root workspace foundation | 5 |
| 2 | TypeScript config package | 4 |
| 3 | ESLint config package | 4 |
| 4 | Prettier config package | 3 |
| 5 | `@googoo/shared` — types, validation, utils | 6 |
| 6 | `@googoo/ui` — design tokens, theme | 9 |
| 7 | Expo mobile app — init + config | 9 |
| 8 | Mobile app — root layout + tabs | 5 |
| 9 | Mobile app — remaining route stubs | 9 |
| 10 | Mobile app — components, hooks, services, stores, constants, types | 21 |
| 11 | Mobile app — e2e test scaffolding | 4 |
| 12 | Supabase — config + all migrations | 14 |
| 13 | Supabase — edge function stubs | 5 |
| 14 | Final verification | 0 (verify only) |

**Total: ~98 files, 14 tasks, 14 commits.**

# Start Expo dev server
dev:
    cd apps/mobile && pnpm dev

# Start Expo for web
dev-web:
    cd apps/mobile && pnpm dev:web

# Start Expo with mock data
dev-mock:
    cd apps/mobile && EXPO_PUBLIC_USE_MOCKS=true pnpm dev

# Start Expo web with mock data
preview:
    cd apps/mobile && EXPO_PUBLIC_USE_MOCKS=true pnpm dev:web

# Run mobile linting
lint:
    cd apps/mobile && pnpm lint

# Run mobile type checking
typecheck:
    cd apps/mobile && pnpm typecheck

# Run mobile tests
test:
    cd apps/mobile && pnpm test

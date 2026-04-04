set dotenv-load
set shell := ["bash", "-uc"]

mod mobile 'mobile.just'
mod db 'supabase.just'

# List all available commands
default:
    @just --list

# Start app with mock data (no backend required)
preview:
    EXPO_PUBLIC_USE_MOCKS=true pnpm --filter @googoo/mobile dev:web

# Run all checks (lint + typecheck)
check:
    pnpm turbo lint typecheck

# Full build (all packages)
build:
    pnpm turbo build

# Format all files
fmt:
    pnpm format

# Check formatting without writing
fmt-check:
    pnpm format:check

# Clean all build artifacts and node_modules
clean:
    pnpm clean

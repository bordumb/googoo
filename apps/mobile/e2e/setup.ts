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

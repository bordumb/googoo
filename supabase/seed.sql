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

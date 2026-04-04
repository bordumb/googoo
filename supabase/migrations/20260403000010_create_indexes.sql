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
-- Composite index for messages RLS policy performance
CREATE INDEX idx_messages_sender_thread ON public.messages(sender_id, thread_id);

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

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

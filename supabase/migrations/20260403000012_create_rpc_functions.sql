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

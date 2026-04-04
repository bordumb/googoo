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

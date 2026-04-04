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

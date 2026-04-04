CREATE TABLE public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    query TEXT,
    filters JSONB NOT NULL,
    notify BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

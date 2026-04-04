CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    images TEXT[],
    parent_id UUID REFERENCES public.posts(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

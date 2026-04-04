CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
    rating BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(transaction_id, reviewer_id)
);

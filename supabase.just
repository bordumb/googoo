# Start local Supabase (requires Docker)
start:
    cd supabase && supabase start

# Stop local Supabase
stop:
    cd supabase && supabase stop

# Reset database (apply migrations + seed)
reset:
    cd supabase && supabase db reset

# Show Supabase status
status:
    cd supabase && supabase status

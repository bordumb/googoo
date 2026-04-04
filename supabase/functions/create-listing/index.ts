// Edge Function: create-listing
// Handles listing creation with server-side validation.
// Invoked via: supabase.functions.invoke('create-listing', { body })

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    // TODO: Validate with createListingSchema from @shared/types.ts
    // TODO: Insert listing via Supabase admin client
    // TODO: Trigger notify-swap-match if listing_type === 'swap'

    return new Response(JSON.stringify({ success: true, data: body }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

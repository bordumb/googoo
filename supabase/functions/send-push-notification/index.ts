// Edge Function: send-push-notification
// Sends push notifications via Expo Push API.
// Called by other Edge Functions or database triggers.

Deno.serve(async (req) => {
  try {
    const { user_id, title, body } = await req.json();

    // TODO: Fetch user's push_token from profiles table
    // TODO: Send notification via Expo Push API
    //   POST https://exp.host/--/api/v2/push/send
    //   { to: pushToken, title, body }

    return new Response(
      JSON.stringify({ success: true, user_id, title }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
